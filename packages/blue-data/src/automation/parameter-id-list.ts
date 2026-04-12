/**
 * ParameterIdList — list of parameter IDs for automation.
 * Mirrors the Java ParameterIdList class.
 */
import { Element } from '../serialization/xml-reader';

export class ParameterIdList {
  private _ids: string[] = [];

  addParameterId(id: string): void {
    this._ids.push(id);
  }

  getIds(): string[] {
    return [...this._ids];
  }

  saveAsXML(): Element {
    const elem = new Element('parameterIdList');
    for (const id of this._ids) {
      elem.addElement('parameterId').setText(id);
    }
    return elem;
  }

  static loadFromXML(data: Element): ParameterIdList {
    const list = new ParameterIdList();
    const ids = data.getElements('parameterId');
    while (ids.hasMoreElements()) {
      list._ids.push(ids.next().getTextString());
    }
    return list;
  }

  deepCopy(): ParameterIdList {
    const copy = new ParameterIdList();
    copy._ids = [...this._ids];
    return copy;
  }
}
