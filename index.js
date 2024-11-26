const { Buffer } = require('buffer');

class FreeD {
  constructor() {
    this.Pitch = 0.0;
    this.Yaw = 0.0;
    this.Roll = 0.0;
    this.PosZ = 0.0;
    this.PosX = 0.0;
    this.PosY = 0.0;
    this.Zoom = 0;
    this.Focus = 0;
  }
}

function decode(data) {
  if (checksum(data) === data[28]) {
    const trackingData = new FreeD();
    trackingData.Pitch = getRotation(data.slice(2, 5));
    trackingData.Yaw = getRotation(data.slice(5, 8));
    trackingData.Roll = getRotation(data.slice(8, 11));
    trackingData.PosZ = getPosition(data.slice(11, 14));
    trackingData.PosX = getPosition(data.slice(14, 17));
    trackingData.PosY = getPosition(data.slice(17, 20));
    trackingData.Zoom = getEncoder(data.slice(20, 23));
    trackingData.Focus = getEncoder(data.slice(23, 26));

    return trackingData;
  }
  throw new Error("calculated checksum does not match provided data. probably not freeD");
}

function encode(data) {
  const output = [];
  output.push(0xD1); // Identifier
  output.push(0xFF); // ID
  output.push(...setRotation(data.Pitch)); // Pitch
  output.push(...setRotation(data.Yaw));   // Yaw
  output.push(...setRotation(data.Roll));  // Roll
  output.push(...setPosition(data.PosZ));  // PosZ
  output.push(...setPosition(data.PosX));  // PosX
  output.push(...setPosition(data.PosY));  // PosY
  output.push(...setEncoder(data.Zoom));   // Zoom
  output.push(...setEncoder(data.Focus));  // Focus
  output.push(0x00, 0x00); // Reserved
  output.push(checksum(output)); // Checksum

  return Buffer.from(output);
}

function setPosition(pos) {
  const position = Math.floor(pos * 64 * 256);
  const buffer = Buffer.alloc(8);
  buffer.writeBigInt64BE(BigInt(position));
  return buffer.slice(4, 7);
}

function setRotation(rot) {
  const rotation = Math.floor(rot * 32768 * 256);
  const buffer = Buffer.alloc(8);
  buffer.writeBigInt64BE(BigInt(rotation));
  return buffer.slice(4, 7);
}

function setEncoder(enc) {
  const buffer = Buffer.alloc(8);
  buffer.writeBigInt64BE(BigInt(enc));
  return Buffer.concat([Buffer.from([0x00]), buffer.slice(6)]);
}

function getPosition(data) {
  return ((data[0] << 24) | (data[1] << 16) | (data[2] << 8)) / 64 / 256;
}

function getRotation(data) {
  return ((data[0] << 24) | (data[1] << 16) | (data[2] << 8)) / 32768 / 256;
}

function getEncoder(data) {
  const value = Buffer.concat([Buffer.from([0x00]), data]);
  return value.readInt32BE();
}

function checksum(data) {
  let sum = 64;
  for (let i = 0; i < 28; i++) {
    sum -= data[i];
  }
  return modulo(sum, 256);
}

function modulo(d, m) {
  const res = d % m;
  return res < 0 ? res + m : res;
}

module.exports = { FreeD, decode, encode };
