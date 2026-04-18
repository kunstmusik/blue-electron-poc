/**
 * CSD Generation Test & Comparison Script
 *
 * Loads demo2022.blue, generates CSD, tests with Csound,
 * and compares against the Java-generated reference CSD.
 */
const path = require('path');
const fs = require('fs');
const { execSync, spawnSync } = require('child_process');
const {
  BlueData,
  initializeJavaScriptRuntime,
} = require('./packages/blue-data/dist/cjs/index.js');

const BLUE_FILE = '/Users/stevenyi/work/blue/demo2024/demo2022.blue';
const REF_CSD = '/Users/stevenyi/work/blue/demo2024/demo2022_rt.csd';
const CSD_OUTPUT = '/tmp/test_blue.csd';

async function main() {
  console.log('=== Loading', BLUE_FILE, '===\n');

  if (!fs.existsSync(BLUE_FILE)) {
    console.error('File not found:', BLUE_FILE);
    process.exit(1);
  }

  const xml = fs.readFileSync(BLUE_FILE, 'utf-8');
  const data = await BlueData.loadFromString(xml);

  await initializeJavaScriptRuntime();

  console.log('Project:', data.getProjectProperties().title || 'Untitled');
  console.log('Author:', data.getProjectProperties().author || 'Unknown');
  console.log('Version:', data.getVersion());

  // Log arrangement
  const arr = data.getArrangement();
  console.log('\nInstruments:', arr.size(), 'assignments');
  for (let i = 0; i < arr.size(); i++) {
    const ia = arr.getArrangement()[i];
    console.log(`  ${ia.arrangementId}: ${ia.instr?.getName() || 'null'}`);
    if (ia.instr && typeof ia.instr.getOpcodeList === 'function') {
      const udos = ia.instr.getOpcodeList().getOpcodes();
      if (udos.length > 0) {
        console.log(`    UDOs: ${udos.map(u => u.getName()).join(', ')}`);
      }
    }
    if (ia.instr && typeof ia.instr.getParameters === 'function') {
      const params = ia.instr.getParameters();
      if (params.length > 0) {
        console.log(`    Parameters: ${params.length}`);
      }
    }
    if (ia.instr && typeof ia.instr.getStringChannels === 'function') {
      const sc = ia.instr.getStringChannels();
      if (sc.length > 0) {
        console.log(`    StringChannels: ${sc.length}`);
      }
    }
  }

  // Generate CSD
  console.log('\n=== Generating CSD ===');
  const csd = data.toCSD();
  fs.writeFileSync(CSD_OUTPUT, csd, 'utf-8');
  console.log('CSD size:', csd.length, 'bytes');
  console.log('Written to:', CSD_OUTPUT);

  // Test with Csound
  console.log('\n=== Testing with Csound ===');
  const result = runCsound(CSD_OUTPUT);
  if (result.success) {
    console.log('CSD compiles and runs successfully');
  } else {
    console.log('CSD FAILED to compile:');
    console.log(result.error);
  }

  // Compare with reference
  if (fs.existsSync(REF_CSD)) {
    console.log('\n=== Comparing with Reference CSD ===');
    compareWithReference(csd, fs.readFileSync(REF_CSD, 'utf-8'));
  } else {
    console.log('\nReference CSD not found:', REF_CSD);
  }
}

function runCsound(csdPath) {
  const result = spawnSync('csound', ['-n', '-o', '/dev/null', '-m135', csdPath], {
    encoding: 'utf-8',
    timeout: 30000,
    maxBuffer: 10 * 1024 * 1024
  });

  if (result.error) {
    return { success: false, error: `csound error: ${result.error.message}`, stdout: '', stderr: result.error.message };
  }

  const success = result.status === 0;
  const output = (result.stdout || '').trim();
  const error = (result.stderr || '').trim();

  return { success, stdout: output, stderr: error, error: error.substring(error.length - 500) };
}

/**
 * Compare generated CSD against reference, section by section.
 */
function compareWithReference(generated, reference) {
  const refSections = parseCSDSections(reference);
  const genSections = parseCSDSections(generated);

  console.log('\nSection comparison:');
  console.log('  Reference sections:', Object.keys(refSections).join(', '));
  console.log('  Generated sections:', Object.keys(genSections).join(', '));

  // Compare CsOptions
  if (refSections.CsOptions === undefined && genSections.CsOptions !== undefined) {
    console.log('\n[DIFF] Reference has NO CsOptions, generated has CsOptions');
    console.log('       Generated:', genSections.CsOptions.trim());
  }

  // Compare CsInstruments header
  compareSection('CsInstruments', genSections.CsInstruments, refSections.CsInstruments);

  // Compare CsScore
  compareSection('CsScore', genSections.CsScore, refSections.CsScore);

  // Detailed header comparison
  console.log('\n--- Detailed CsInstruments differences ---');
  compareInstrumentsDetail(genSections.CsInstruments, refSections.CsInstruments);

  // Detailed score comparison
  console.log('\n--- Detailed CsScore differences ---');
  compareScoreDetail(genSections.CsScore, refSections.CsScore);
}

function parseCSDSections(csd) {
  const sections = {};
  const csOptionsMatch = csd.match(/<CsOptions>([\s\S]*?)<\/CsOptions>/);
  if (csOptionsMatch) sections.CsOptions = csOptionsMatch[1].trim();

  const csInstrMatch = csd.match(/<CsInstruments>([\s\S]*?)<\/CsInstruments>/);
  if (csInstrMatch) sections.CsInstruments = csInstrMatch[1];

  const csScoreMatch = csd.match(/<CsScore>([\s\S]*?)<\/CsScore>/);
  if (csScoreMatch) sections.CsScore = csScoreMatch[1];

  return sections;
}

function compareSection(name, generated, reference) {
  if (!generated || !reference) {
    console.log(`  [${name}] Missing section`);
    return;
  }

  const genLines = generated.split('\n').filter(l => l.trim());
  const refLines = reference.split('\n').filter(l => l.trim());

  console.log(`\n  [${name}] Generated: ${genLines.length} non-empty lines, Reference: ${refLines.length} non-empty lines`);

  if (genLines.length === refLines.length) {
    let diffs = 0;
    for (let i = 0; i < genLines.length; i++) {
      if (genLines[i].trim() !== refLines[i].trim()) diffs++;
    }
    if (diffs === 0) {
      console.log(`  [${name}] MATCHES reference`);
    } else {
      console.log(`  [${name}] ${diffs} lines differ`);
    }
  } else {
    console.log(`  [${name}] Line count differs by ${Math.abs(genLines.length - refLines.length)} lines`);
  }
}

function compareInstrumentsDetail(genInstr, refInstr) {
  // Extract mixer init statements
  const refMixerInits = refInstr.match(/ga_\w+\s+init\s+0/g) || [];
  const genMixerInits = genInstr.match(/ga_\w+\s+init\s+0/g) || [];
  console.log('  Mixer inits - Reference:', refMixerInits.length, ', Generated:', genMixerInits.length);
  const missingInits = refMixerInits.filter(i => !genMixerInits.includes(i));
  if (missingInits.length > 0) {
    console.log('  Missing mixer inits:', missingInits);
  }

  // Extract parameter init statements
  const refParams = (refInstr.match(/gk_blue_auto\d+\s+init\s+[\d.-]+/g) || []);
  const genParams = (genInstr.match(/gk_blue_auto\d+\s+init\s+[\d.-]+/g) || []);
  console.log('  Parameters - Reference:', refParams.length, ', Generated:', genParams.length);

  // Extract string channel inits
  const refStrings = (refInstr.match(/gS_blue_str\d+/g) || []).filter((v, i, a) => a.indexOf(v) === i);
  const genStrings = (genInstr.match(/gS_blue_str\d+/g) || []).filter((v, i, a) => a.indexOf(v) === i);
  console.log('  String channels - Reference:', refStrings.length, ', Generated:', genStrings.length);

  // Extract UDOs
  const refOpcodes = (refInstr.match(/opcode\s+\w+/g) || []).map(s => s.replace('opcode ', ''));
  const genOpcodes = (genInstr.match(/opcode\s+\w+/g) || []).map(s => s.replace('opcode ', ''));
  console.log('  UDOs - Reference:', refOpcodes.length, ', Generated:', genOpcodes.length);
  const missingOpcodes = refOpcodes.filter(o => !genOpcodes.includes(o));
  if (missingOpcodes.length > 0) {
    console.log('  Missing UDOs:', missingOpcodes);
  }

  // Extract instruments
  const refInstrIds = (refInstr.match(/instr\s+\S+/g) || []);
  const genInstrIds = (genInstr.match(/instr\s+\S+/g) || []);
  console.log('  Instruments - Reference:', refInstrIds.join(', '));
  console.log('  Instruments - Generated:', genInstrIds.join(', '));
  const missingInstr = refInstrIds.filter(i => !genInstrIds.includes(i));
  if (missingInstr.length > 0) {
    console.log('  Missing instruments:', missingInstr);
  }

  // Check if generated uses hardcoded values instead of gk_blue_auto
  const hardcodedValues = genInstr.match(/i\([\d.]+\)/g) || [];
  const paramRefs = genInstr.match(/i\(gk_blue_auto\d+\)/g) || [];
  console.log('  Hardcoded i() values:', hardcodedValues.length, '(should be 0 if using params)');
  console.log('  Parameter refs i(gk_blue_autoN):', paramRefs.length);
}

function compareScoreDetail(genScore, refScore) {
  // Check for tempo statement
  const refTempo = refScore.match(/t\s+\d[\s\d.]+/);
  const genTempo = genScore.match(/t\s+\d[\s\d.]+/);
  console.log('  Tempo - Reference:', refTempo ? refTempo[0].substring(0, 40) : 'none');
  console.log('  Tempo - Generated:', genTempo ? genTempo[0].substring(0, 40) : 'none');

  // Count score events by instrument (match "i1\t...", "i 1 ...", "i"BlueMixer"...")
  const refNotes = refScore.match(/^i[\d"'\t ].+/gm) || [];
  const genNotes = genScore.match(/^i[\d"'\t ].+/gm) || [];
  console.log('  Score events - Reference:', refNotes.length, ', Generated:', genNotes.length);

  // Check for always-on instruments
  const refAlwaysOn = refNotes.filter(n => /^\d+\s+\d+\s+\d+\s*$/.test(n.trim()) || /^i\d+\s+0\s+/.test(n.trim()));
  console.log('  Always-on events in reference:', refAlwaysOn.slice(0, 5).join(', '));

  // Check for 'e' statement
  const hasE_ref = refScore.includes('\ne');
  const hasE_gen = genScore.includes('\ne');
  console.log('  End statement - Reference:', hasE_ref, ', Generated:', hasE_gen);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
