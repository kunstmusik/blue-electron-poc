/**
 * ParameterHelper — collects all automation parameters from arrangement and mixer.
 * Mirrors the Java ParameterHelper class.
 *
 * Parameters are collected from:
 * - Instruments in the arrangement (if they implement Automatable)
 * - Mixer source channels: effect parameters + channel volume + send amounts
 * - Mixer sub channels: effect parameters + channel volume
 * - Mixer master: channel volume
 */
import { Parameter } from '../automation/parameter';
import { Arrangement } from '../arrangement';
import { Mixer } from '../mixer/mixer';
import { Channel } from '../mixer/channel';
import { Effect } from '../mixer/effect';

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

  // Parameters from mixer source channels
  for (const channel of mixer.getAllSourceChannels()) {
    collectChannelParameters(channel, parameters);
  }

  // Parameters from mixer sub channels
  for (const subChannel of mixer.getSubChannels()) {
    collectChannelParameters(subChannel, parameters);
  }

  // Master channel volume
  const masterChannel = (mixer as any)._channels?.find?.(
    (ch: Channel) => ch.getName() === 'Master'
  );
  if (!masterChannel) {
    // Check if Master is a separate element
    const subChs = mixer.getSubChannels();
    for (const sub of subChs) {
      if (sub.getName() === 'Master') {
        collectChannelParameters(sub, parameters);
      }
    }
  }

  return parameters;
}

/**
 * Collect parameters from a mixer channel: effects, volume, and sends.
 */
function collectChannelParameters(channel: Channel, parameters: Parameter[]): void {
  // Effect parameters from pre-effects
  const preEffects = channel.getPreEffects();
  for (const effect of preEffects) {
    if (!effect.isEnabled()) continue;
    const effectParams = effect.getParameters();
    if (effectParams && Array.isArray(effectParams)) {
      parameters.push(...effectParams);
    }
  }

  // Effect parameters from post-effects
  const postEffects = channel.getPostEffects();
  for (const effect of postEffects) {
    if (!effect.isEnabled()) continue;
    const effectParams = effect.getParameters();
    if (effectParams && Array.isArray(effectParams)) {
      parameters.push(...effectParams);
    }
  }

  // Channel volume parameter
  const channelParam = channel.getChannelParameter();
  if (channelParam) {
    parameters.push(channelParam);
  }

  // Send parameters
  for (const send of channel.getSends()) {
    const sendParam = send.getParameter();
    if (sendParam) {
      parameters.push(sendParam);
    }
  }
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
