#!/usr/bin/env node
/**
 * Round-trip XML serialization test.
 * Loads a .blue file using @blue/data, saves it, and compares the output.
 *
 * Usage: node scripts/round-trip-test.mjs <input.blue> [output.blue]
 */
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { BlueData } from '@blue/data';

async function main() {
  const inputPath = resolve(process.argv[2]);
  const outputPath = resolve(process.argv[3] || inputPath.replace('.blue', '_roundtrip.blue'));

  const xml = await readFile(inputPath, 'utf-8');
  const data = BlueData.loadFromXML(xml);
  const saved = data.saveAsXML();

  await writeFile(outputPath, saved, 'utf-8');
  console.log(`Loaded:  ${inputPath}`);
  console.log(`Saved:   ${outputPath}`);
}

main().catch(e => { console.error(e); process.exit(1); });
