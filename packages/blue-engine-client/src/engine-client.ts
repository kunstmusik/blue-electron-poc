/**
 * EngineClient — ZMQ REQ/REP client for the C++ blue-engine process.
 *
 * Manages connection to a running blue-engine executable and provides
 * methods for all protocol commands.
 */
import { Request } from 'zeromq';
import {
  encodeCommand,
  decodeResponse,
  encodeSetChannel,
  encodeGetChannel,
  decodeChannelValue,
  CMD_CREATE_ENGINE,
  CMD_COMPILE_ORC,
  CMD_READ_SCORE,
  CMD_SET_OPTION,
  CMD_START,
  CMD_STOP,
  CMD_EXIT,
  CMD_CREATE_CHANNEL,
} from './protocol';

export interface EngineClientOptions {
  /** ZMQ endpoint (default: tcp://localhost:5555) */
  endpoint?: string;
  /** Connection timeout in ms (default: 5000) */
  timeout?: number;
}

export class EngineClient {
  private socket: Request | null = null;
  private endpoint: string;
  private timeout: number;

  constructor(options: EngineClientOptions = {}) {
    this.endpoint = options.endpoint ?? 'tcp://localhost:5555';
    this.timeout = options.timeout ?? 5000;
  }

  /**
   * Connect to the blue-engine process.
   */
  async connect(): Promise<void> {
    if (this.socket) {
      return; // Already connected
    }
    this.socket = new Request();
    this.socket.connect(this.endpoint);
  }

  /**
   * Disconnect from the engine.
   */
  async disconnect(): Promise<void> {
    if (this.socket) {
      await this.send(CMD_EXIT);
      this.socket.close();
      this.socket = null;
    }
  }

  /**
   * Send a raw command and get the response.
   */
  private async send(cmd: number, payload?: string): Promise<string> {
    if (!this.socket) {
      throw new Error('EngineClient not connected. Call connect() first.');
    }
    const data = encodeCommand(cmd, payload);
    await this.socket.send(data);
    const [response] = await this.socket.receive();
    return decodeResponse(response as Buffer);
  }

  /**
   * Create the Csound engine instance.
   * Must be called before any other command.
   */
  async createEngine(): Promise<void> {
    await this.send(CMD_CREATE_ENGINE);
  }

  /**
   * Set a Csound option (e.g., '-odac', '-d').
   */
  async setOption(option: string): Promise<void> {
    await this.send(CMD_SET_OPTION, option);
  }

  /**
   * Compile a Csound orchestra string.
   */
  async compileOrc(orchestra: string): Promise<void> {
    await this.send(CMD_COMPILE_ORC, orchestra);
  }

  /**
   * Submit a Csound score string.
   */
  async readScore(score: string): Promise<void> {
    await this.send(CMD_READ_SCORE, score);
  }

  /**
   * Start Csound performance.
   * Launches the perform thread which runs in a loop.
   */
  async start(): Promise<void> {
    await this.send(CMD_START);
  }

  /**
   * Stop Csound performance.
   */
  async stop(): Promise<void> {
    await this.send(CMD_STOP);
  }

  /**
   * Create a named channel with an initial value.
   */
  async createChannel(name: string, initialValue: number): Promise<void> {
    const nameBuf = Buffer.from(name, 'utf-8');
    const buf = Buffer.alloc(1 + 1 + nameBuf.length + 8);
    buf.writeUInt8(CMD_CREATE_CHANNEL, 0);
    buf.writeUInt8(nameBuf.length, 1);
    nameBuf.copy(buf, 2);
    buf.writeDoubleLE(initialValue, 2 + nameBuf.length);

    if (!this.socket) {
      throw new Error('EngineClient not connected.');
    }
    await this.socket.send(buf);
    await this.socket.receive();
  }

  /**
   * Set a channel value.
   */
  async setChannel(name: string, value: number): Promise<void> {
    if (!this.socket) {
      throw new Error('EngineClient not connected.');
    }
    const data = encodeSetChannel(name, value);
    await this.socket.send(data);
    await this.socket.receive();
  }

  /**
   * Get a channel value.
   */
  async getChannel(name: string): Promise<number> {
    if (!this.socket) {
      throw new Error('EngineClient not connected.');
    }
    const data = encodeGetChannel(name);
    await this.socket.send(data);
    const [response] = await this.socket.receive();
    return decodeChannelValue(response as Buffer);
  }

  /**
   * Get the shared memory region name.
   */
  async getShmName(): Promise<string> {
    return this.send(0x13); // CMD_GET_SHM_NAME
  }
}
