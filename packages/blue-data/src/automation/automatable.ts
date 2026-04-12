/**
 * Automatable — interface for objects that support automation.
 * Mirrors the Java Automatable interface.
 */
import { ParameterIdList } from './parameter-id-list';

export interface Automatable {
  getAutomationParameters(): ParameterIdList;
}
