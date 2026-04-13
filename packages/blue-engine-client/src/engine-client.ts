/**
 * EngineClient — ZMQ REQ/REP client for the C++ blue-engine process.
 *
 * Manages connection to a running blue-engine executable and provides
 * methods for all protocol commands.
 */
import { Request } from 'zeromq';
import {
  encodeCommand,
  encodeSetChannel,
  encodeGetChannel,
  CMD_CREATE_ENGINE,
  CMD_COMPILE_ORC,
  CMD_READ_SCORE,
  CMD_SET_OPTION,
  CMD_START,
  CMD_STOP,
  CMD_EXIT,
  CMD_CREATE_CHANNEL,
} from './protocol';

// Status codes (from engine protocol)
const STATUS_OK = 0x00;
const STATUS_ERROR = 0x01;

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
      await this.sendRaw(CMD_EXIT);
      this.socket.close();
      this.socket = null;
    }
  }

  /**
   * Send a raw command and parse the response.
   * Response format: [status: uint8][msg_len: uint32 LE][message: bytes]
   */
  private async sendRaw(cmd: number, payload?: Buffer): Promise<{ ok: boolean; message: string }> {
    if (!this.socket) {
      throw new Error('EngineClient not connected. Call connect() first.');
    }

    if (payload) {
      await this.socket.send(payload);
    } else {
      await this.socket.send(Buffer.from([cmd]));
    }

    const [response] = await this.socket.receive();
    const respBuf = response as Buffer;

    if (respBuf.length < 5) {
      return { ok: false, message: 'Invalid response (too short)' };
    }

    const status = respBuf.readUInt8(0);
    const msgLen = respBuf.readUInt32LE(1);
    const message = respBuf.slice(5, 5 + msgLen).toString('utf-8');

    return { ok: status === STATUS_OK, message };
  }

  /**
   * Create the Csound engine instance.
   * Must be called before any other command.
   */
  async createEngine(): Promise<{ ok: boolean; message: string }> {
    // If engine already exists, destroy it first
    let resp = await this.sendRaw(CMD_CREATE_ENGINE);
    if (!resp.ok && resp.message.includes('Engine already created')) {
      await this.sendRaw(CMD_EXIT); // DESTROY_ENGINE
      resp = await this.sendRaw(CMD_CREATE_ENGINE);
    }
    return resp;
  }

  /**
   * Set a Csound option (e.g., '-odac', '-d').
   */
  async setOption(option: string): Promise<{ ok: boolean; message: string }> {
    return this.sendCommand(CMD_SET_OPTION, option);
  }

  /**
   * Compile a Csound orchestra string.
   */
  async compileOrc(orchestra: string): Promise<{ ok: boolean; message: string }> {
    return this.sendCommand(CMD_COMPILE_ORC, orchestra);
  }

  /**
   * Submit a Csound score string.
   */
  async readScore(score: string): Promise<{ ok: boolean; message: string }> {
    return this.sendCommand(CMD_READ_SCORE, score);
  }

  /**
   * Start Csound performance.
   */
  async start(): Promise<{ ok: boolean; message: string }> {
    return this.sendRaw(CMD_START);
  }

  /**
   * Stop Csound performance.
   */
  async stop(): Promise<{ ok: boolean; message: string }> {
    return this.sendRaw(CMD_STOP);
  }

  /**
   * Send a command with a string payload.
   */
  private async sendCommand(cmd: number, payload: string): Promise<{ ok: boolean; message: string }> {
    const payloadBuf = Buffer.from(payload, 'utf-8');
    const buf = Buffer.alloc(5 + payloadBuf.length);
    buf.writeUInt8(cmd, 0);
    buf.writeUInt32LE(payloadBuf.length, 1);
    payloadBuf.copy(buf, 5);
    return this.sendRaw(cmd, buf);
  }

  /**
   * Create a named channel with an initial value.
   */
  async createChannel(name: string, initialValue: number): Promise<{ ok: boolean; message: string }> {
    const nameBuf = Buffer.from(name + '\0', 'utf-8');
    const valueBuf = Buffer.alloc(8);
    valueBuf.writeDoubleLE(initialValue, 0);
    const payload = Buffer.concat([nameBuf, valueBuf]);

    const cmdBuf = Buffer.alloc(5 + payload.length);
    cmdBuf.writeUInt8(CMD_CREATE_CHANNEL, 0);
    cmdBuf.writeUInt32LE(payload.length, 1);
    payload.copy(cmdBuf, 5);

    return this.sendRaw(CMD_CREATE_CHANNEL, cmdBuf);
  }

  /**
   * Set a channel value.
   */
  async setChannel(name: string, value: number): Promise<{ ok: boolean; message: string }> {
    if (!this.socket) {
      throw new Error('EngineClient not connected.');
    }
    const data = encodeSetChannel(name, value);
    return this.sendRaw(0x10, data); // CMD_SET_CHANNEL
  }

  /**
   * Get a channel value.
   */
  async getChannel(name: string): Promise<{ ok: boolean; value: number }> {
    if (!this.socket) {
      throw new Error('EngineClient not connected.');
    }
    const data = encodeGetChannel(name);
    const resp = await this.sendRaw(0x11, data); // CMD_GET_CHANNEL
    if (resp.ok && resp.message.length >= 8) {
      const buf = Buffer.from(resp.message, 'latin1');
      return { ok: true, value: buf.readDoubleLE(0) };
    }
    return { ok: false, value: 0 };
  }

  /**
   * Get the shared memory region name.
   */
  async getShmName(): Promise<{ ok: boolean; message: string }> {
    return this.sendRaw(0x13); // CMD_GET_SHM_NAME
  }
}
