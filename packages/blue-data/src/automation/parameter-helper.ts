/**
 * ParameterHelper — collects all automation parameters from arrangement and mixer.
 * Mirrors the Java ParameterHelper class.
 *
 * Parameters are collected from:
 * - Instruments in the arrangement (if they implement Automatable)
 * - Mixer channels (if they implement Automatable)
 * - Mixer sub channels (if they implement Automatable)
 */
import { Parameter } from '../automation/parameter';
import { Arrangement } from '../arrangement';
import { Mixer } from '../mixer/mixer';

/**
 * Get all parameters from arrangement and mixer.
 */
export function getAllParameters(arrangement: Arrangement, mixer: Mixer): Parameter[] {
  const parameters: Parameter[] = [];

  // Parameters from instruments in arrangement
  for (const ia of arrangement.getArrangement()) {
    if (!ia.enabled || !ia.instr) continue;
    const instr = ia.instr as any;
    if (typeof instr.getParameters === 'function') {
      const instrParams = instr.getParameters();
      if (instrParams && Array.isArray(instrParams)) {
        parameters.push(...instrParams);
      }
    }
  }

  // Parameters from mixer channels
  for (const channel of mixer.getAllSourceChannels()) {
    const chParams = (channel as any).getParameters?.();
    if (chParams && Array.isArray(chParams)) {
      parameters.push(...chParams);
    }
  }

  // Parameters from mixer sub channels
  for (const subChannel of mixer.getSubChannels()) {
    const subParams = (subChannel as any).getParameters?.();
    if (subParams && Array.isArray(subParams)) {
      parameters.push(...subParams);
    }
  }

  return parameters;
}

/**
 * Assign compilation variable names to parameters.
 * Names are: gk_blue_auto0, gk_blue_auto1, ...
 */
export function assignParameterNames(parameters: Parameter[]): void {
  for (let i = 0; i < parameters.length; i++) {
    parameters[i].setCompilationVarName(`gk_blue_auto${i}`);
  }
}
