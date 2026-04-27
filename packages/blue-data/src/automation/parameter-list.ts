/**
 * ParameterList — list of automation Parameters.
 * Mirrors the Java ParameterList class.
 */
import { Parameter } from './parameter';
import { Element } from '../serialization/xml-reader';

export class ParameterList extends Array<Parameter> {
  saveAsXML(): Element {
    const elem = new Element('parameterList');
    for (const param of this) {
      elem.addElement(param.saveAsXML());
    }
    return elem;
  }

  static loadFromXML(data: Element): ParameterList {
    const list = new ParameterList();
    const params = data.getElements('parameter');
    while (params.hasMoreElements()) {
      list.push(Parameter.loadFromXML(params.next()));
    }
    return list;
  }

  deepCopy(): ParameterList {
    const copy = new ParameterList();
    for (const p of this) {
      copy.push(p.deepCopy() as Parameter);
    }
    return copy;
  }
}
