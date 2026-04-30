import { describe, expect, it } from 'vitest';
import { Element } from '../serialization/xml-reader';
import { AutomationCurve, Parameter } from './parameter';

describe('Parameter compatibility', () => {
  it('round-trips XML state and automation points', () => {
    const parameter = new Parameter();
    parameter.setUniqueId('p1');
    parameter.setName('gain');
    parameter.setLabel('Gain');
    parameter.setMinimum(0);
    parameter.setMaximum(1);
    parameter.setCurve(AutomationCurve.LINEAR);
    parameter.setAutomationEnabled(true);
    parameter.setFixedValue(0.5);
    parameter.addPoint(0, 0.25);
    parameter.addPoint(4, 0.75);

    const reloaded = Parameter.loadFromXML(Element.parse(parameter.saveAsXML().toXml()));

    expect(reloaded.getUniqueId()).toBe('p1');
    expect(reloaded.getName()).toBe('gain');
    expect(reloaded.getLabel()).toBe('Gain');
    expect(reloaded.getMinimum()).toBeCloseTo(0, 6);
    expect(reloaded.getMaximum()).toBeCloseTo(1, 6);
    expect(reloaded.isAutomationEnabled()).toBe(true);
    expect(reloaded.getPoints()).toHaveLength(2);
  });

  it('returns the fixed value when automation is disabled', () => {
    const parameter = new Parameter();
    parameter.setFixedValue(0.75);
    parameter.setAutomationEnabled(false);

    expect(parameter.getValue(10)).toBeCloseTo(0.75, 6);
  });
});