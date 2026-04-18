/**
 * Arrangement — maps instruments to instrument IDs for CSD generation.
 * Mirrors the Java Arrangement class.
 *
 * The Arrangement holds a list of InstrumentAssignments, each linking an
 * instrument from the InstrumentLibrary to a specific instrument ID in the
 * generated CSD.
 */
import { InstrumentAssignment } from "./instruments/instrument-assignment";
import { Instrument } from "./instruments/instrument";
import { loadInstrumentFromXML } from "./instruments/instrument-registry";
import { CompileData } from "./compile-data";
import { Parameter } from "./automation/parameter";
import { replaceAll, stripSingleLineComments } from "./utilities/text";
import { Element } from "./serialization/xml-reader";
import { Mixer } from "./mixer/mixer";
import { Channel } from "./mixer/channel";

export class Arrangement {
  private arrangement: InstrumentAssignment[] = [];

  constructor(other?: Arrangement) {
    if (other) {
      for (const ia of other.arrangement) {
        this.arrangement.push(new InstrumentAssignment(ia));
      }
    }
  }

  // ─── Instrument management ───

  addInstrument(instrument: Instrument, instrumentId?: string): number {
    const id = instrumentId || "0";
    const ia = new InstrumentAssignment();
    ia.arrangementId = id;
    ia.instr = instrument;
    this.arrangement.push(ia);
    this.sort();
    return this.arrangement.length;
  }

  size(): number {
    return this.arrangement.length;
  }

  getInstrumentId(index: number): string {
    return this.arrangement[index]?.arrangementId ?? "";
  }

  getInstrument(index: number): Instrument {
    return this.arrangement[index]?.instr;
  }

  getInstrumentById(id: string): Instrument | undefined {
    return this.arrangement.find((ia) => ia.arrangementId === id)?.instr;
  }

  getArrangement(): InstrumentAssignment[] {
    return [...this.arrangement];
  }

  removeInstrument(index: number): Instrument | null {
    return this.arrangement.splice(index, 1)[0]?.instr ?? null;
  }

  private sort(): void {
    this.arrangement.sort((a, b) => a.compareTo(b));
  }

  // ─── CSD Generation ───

  /**
   * Generate the orchestra section from all enabled instruments.
   * Skips assignments where the instrument reference is not resolved
   * (this happens when loading from XML without a library second-pass).
   *
   * @param compileData - Shared compilation context
   * @param parameterMap - Optional map from instrument to its Parameter[] for automation
   */
  generateOrchestra(
    compileData: CompileData,
    mixer?: Mixer,
    nchnls = 2,
    parameterMap?: Map<Instrument, Parameter[]>,
  ): string {
    const buffer: string[] = [];

    for (const ia of this.arrangement) {
      if (!ia.enabled) continue;
      if (!ia.instr) continue; // Skip unresolved instrument references

      // Get parameters for this instrument if available
      const instrParams = parameterMap?.get(ia.instr);

      // Use parameter-aware generateInstrument if parameters are available
      let instrumentText: string;
      if (
        instrParams &&
        typeof (ia.instr as any).generateInstrument === "function"
      ) {
        instrumentText = (ia.instr as any).generateInstrument(instrParams);
      } else {
        instrumentText = ia.instr.generateInstrument();
      }
      if (!instrumentText) continue;

      // Transform instrument text with arrangement ID substitution
      let transformed = this.replaceInstrumentId(
        ia.arrangementId,
        instrumentText,
      );

      // Handle blueMixerOut → outc conversion
      transformed = this.convertBlueMixerOut(
        compileData,
        mixer,
        ia.arrangementId,
        transformed,
        nchnls,
      );

      // Java CSDRender appends "\n" after transformed text:
      // buffer.append(transformed).append("\n");
      // This ensures endin is on its own line
      if (!transformed.endsWith("\n")) {
        transformed += "\n";
      }
      if (!transformed.endsWith("\n\n")) {
        transformed += "\n";
      }

      buffer.push(`\tinstr ${ia.arrangementId}\t;${ia.instr.getName()}\n`);
      buffer.push(transformed);
      buffer.push("\tendin\n\n");
    }

    return buffer.join("");
  }

  /**
   * Generate global orchestra code from all instruments.
   */
  generateGlobalOrc(compileData: CompileData): string {
    const buffer: string[] = [];

    for (const ia of this.arrangement) {
      if (!ia.enabled) continue;
      if (!ia.instr) continue; // Skip unresolved instrument references
      const globalOrc = ia.instr.generateGlobalOrc();
      if (globalOrc) {
        buffer.push(this.replaceInstrumentId(ia.arrangementId, globalOrc));
      }
    }

    return buffer.join("\n");
  }

  private replaceInstrumentId(arrangementId: string, input: string): string {
    let replacementId: string;
    const numId = parseInt(arrangementId, 10);
    if (!isNaN(numId)) {
      replacementId = numId.toString();
    } else {
      replacementId = `"${arrangementId}"`;
    }

    let transformed = replaceAll(input, "<INSTR_ID>", replacementId);
    transformed = replaceAll(transformed, "<INSTR_NAME>", arrangementId);
    return transformed;
  }

  private convertBlueMixerOut(
    compileData: CompileData,
    mixer: Mixer | undefined,
    arrangementId: string,
    input: string,
    nchnls: number,
  ): string {
    if (!input.includes("blueMixerOut") && !input.includes("blueMixerIn")) {
      return input;
    }

    const buffer: string[] = [];
    const lines = input.split(/\r?\n/);
    let blueMixerInFound = false;

    for (const line of lines) {
      const mixerInIndex = line.indexOf("blueMixerIn");

      if (mixerInIndex > 0) {
        const noCommentLine = stripSingleLineComments(line);
        if (!noCommentLine.includes("blueMixerIn")) {
          buffer.push(line);
          continue;
        }

        if (!mixer?.isEnabled()) {
          throw new Error(
            "Error: Instrument uses blueMixerIn but mixer is not enabled",
          );
        }

        blueMixerInFound = true;
        const argText = noCommentLine.substring(0, mixerInIndex).trim();
        const args = argText.split(",");
        const channel = this.getChannelForArrangementId(mixer, arrangementId);

        for (let i = 0; i < nchnls && i < args.length; i++) {
          const arg = args[i].trim();
          const variable = this.getMixerVariable(
            compileData,
            mixer,
            channel,
            i,
          );
          buffer.push(`${arg} = ${variable}`);
        }

        continue;
      }

      if (line.trim().startsWith("blueMixerOut")) {
        const argText = line.trim().substring(12);
        const args = argText.split(",");
        const firstArg = args[0]?.trim() ?? "";

        if (/^".*"$/.test(firstArg)) {
          if (!mixer?.isEnabled()) {
            buffer.push(`outc ${args.slice(1).join(",")}`);
            continue;
          }

          const subChannelName = firstArg.substring(1, firstArg.length - 1);
          const subChannel = Array.from(mixer.getSubChannels()).find(
            (channel) => subChannelName === channel.getName(),
          );

          if (!subChannel) {
            throw new Error(
              `Unable to find subchannel with name: ${subChannelName}`,
            );
          }

          mixer.addSubChannelDependency(subChannelName);

                for (let i = 1; i < nchnls + 1 && i < args.length; i++) {
                  const arg = args[i] ?? "";
            const variable = Mixer.getSubChannelVar(subChannelName, i - 1);
            const operator = blueMixerInFound ? "=" : "+=";
            buffer.push(`${variable} ${operator} ${arg}`);
          }

          continue;
        }

        if (!mixer?.isEnabled()) {
          buffer.push(line.replaceAll("blueMixerOut", "outc"));
          continue;
        }

        const channel = this.getChannelForArrangementId(mixer, arrangementId);
        for (let i = 0; i < nchnls && i < args.length; i++) {
          const arg = args[i] ?? "";
          const variable = this.getMixerVariable(
            compileData,
            mixer,
            channel,
            i,
          );
          const operator = blueMixerInFound ? "=" : "+=";
          buffer.push(`${variable} ${operator} ${arg}`);
        }

        continue;
      }

      buffer.push(line);
    }

    return buffer.join("\n");
  }

  private getChannelForArrangementId(
    mixer: Mixer,
    arrangementId: string,
  ): Channel | undefined {
    return mixer
      .getAllSourceChannels()
      .find((channel) => channel.getName() === arrangementId);
  }

  private getMixerVariable(
    compileData: CompileData,
    mixer: Mixer,
    channel: Channel | undefined,
    outputIndex: number,
  ): string {
    if (!channel) {
      return Mixer.getSubChannelVar(Mixer.MASTER_CHANNEL, outputIndex);
    }

    const channelId = compileData.getChannelIdAssignments().get(channel);
    if (typeof channelId !== "number") {
      throw new Error(
        `Unable to find mixer channel assignment for channel: ${channel.getName()}`,
      );
    }

    return Mixer.getChannelVar(channelId, outputIndex);
  }

  // ─── XML Serialization ───

  saveAsXML(): Element {
    const elem = new Element("arrangement");
    for (const ia of this.arrangement) {
      const iaElem = new Element("instrumentAssignment");
      iaElem.setAttribute("id", ia.arrangementId);
      iaElem.setAttribute("enabled", ia.enabled.toString());
      // Instrument reference is stored separately in InstrumentLibrary
      elem.addElement(iaElem);
    }
    return elem;
  }

  static loadFromXML(data: Element): Arrangement {
    const arr = new Arrangement();
    const items = data.getElements("instrumentAssignment");

    while (items.hasMoreElements()) {
      const elem = items.next();
      const ia = new InstrumentAssignment();
      ia.arrangementId =
        elem.getAttribute("arrangementId") ?? elem.getAttribute("id") ?? "0";
      ia.enabled = elem.getAttribute("enabled") !== "false";

      // Load embedded <instrument> element if present
      const instrElem = elem.getElement("instrument");
      if (instrElem) {
        const instr = loadInstrumentFromXML(instrElem);
        if (instr) {
          ia.instr = instr;
        }
      }

      arr.arrangement.push(ia);
    }

    return arr;
  }

  static loadFromXMLWithLibrary(
    data: Element,
    _iLibrary: unknown,
  ): Arrangement {
    return Arrangement.loadFromXML(data);
  }
}
