/**
 * Binary protocol constants for the blue-engine ZMQ communication.
 * Based on the C++ blue-engine protocol specification.
 */

// Engine lifecycle commands
export const CMD_CREATE_ENGINE = 0x01;
export const CMD_COMPILE_ORC = 0x02;
export const CMD_READ_SCORE = 0x03;
export const CMD_SET_OPTION = 0x04;
export const CMD_START = 0x05;
export const CMD_STOP = 0x06;
export const CMD_EXIT = 0x07;

// Channel commands
export const CMD_SET_CHANNEL = 0x10;
export const CMD_GET_CHANNEL = 0x11;
export const CMD_CREATE_CHANNEL = 0x12;
export const CMD_GET_SHM_NAME = 0x13;

// Automation commands
export const CMD_CREATE_AUTOMATION = 0x20;
export const CMD_UPDATE_AUTOMATION = 0x21;
export const CMD_DELETE_AUTOMATION = 0x22;
export const CMD_ENABLE_AUTOMATION = 0x23;
export const CMD_DISABLE_AUTOMATION = 0x24;
export const CMD_LIST_AUTOMATION = 0x25;
export const CMD_CLEAR_AUTOMATION = 0x26;

/**
 * Encode a command with optional string payload into a binary buffer.
 * Format: [command: uint8][payload_length: uint32 LE][payload: bytes]
 */
export function encodeCommand(cmd: number, payload?: string): Buffer {
  if (!payload) {
    return Buffer.from([cmd]);
  }
  const payloadBuf = Buffer.from(payload, 'utf-8');
  const buf = Buffer.alloc(5 + payloadBuf.length);
  buf.writeUInt8(cmd, 0);
  buf.writeUInt32LE(payloadBuf.length, 1);
  payloadBuf.copy(buf, 5);
  return buf;
}

/**
 * Decode a response buffer.
 * Returns the payload string, or empty string for no-payload responses.
 */
export function decodeResponse(buf: Buffer): string {
  if (buf.length === 0) return '';
  if (buf.length === 1) return '';
  if (buf.length < 5) return buf.toString('utf-8', 1);

  const payloadLen = buf.readUInt32LE(1);
  if (payloadLen === 0) return '';
  return buf.toString('utf-8', 5, 5 + payloadLen);
}

/**
 * Encode a channel set command.
 * Format: [CMD_SET_CHANNEL][payload: name\0 + value_f64]
 * Note: name must be null-terminated (matching engine protocol)
 */
export function encodeSetChannel(name: string, value: number): Buffer {
  const nameBuf = Buffer.from(name + '\0', 'utf-8');
  const valueBuf = Buffer.alloc(8);
  valueBuf.writeDoubleLE(value, 0);
  const payload = Buffer.concat([nameBuf, valueBuf]);

  const buf = Buffer.alloc(5 + payload.length);
  buf.writeUInt8(CMD_SET_CHANNEL, 0);
  buf.writeUInt32LE(payload.length, 1);
  payload.copy(buf, 5);
  return buf;
}

/**
 * Encode a channel get command.
 * Format: [CMD_GET_CHANNEL][payload: name\0]
 * Note: name must be null-terminated (matching engine protocol)
 */
export function encodeGetChannel(name: string): Buffer {
  const nameBuf = Buffer.from(name + '\0', 'utf-8');

  const buf = Buffer.alloc(5 + nameBuf.length);
  buf.writeUInt8(CMD_GET_CHANNEL, 0);
  buf.writeUInt32LE(nameBuf.length, 1);
  nameBuf.copy(buf, 5);
  return buf;
}

/**
 * Decode a channel value response.
 * Returns the float64 value.
 */
export function decodeChannelValue(buf: Buffer): number {
  if (buf.length < 9) return 0;
  return buf.readDoubleLE(1);
}
