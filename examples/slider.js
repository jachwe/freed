const dgram = require('dgram');
const { FreeD, encode } = require('../index');
const client = dgram.createSocket('udp4');

// Configuration
const PORT = 6301;
const HOST = '127.0.0.1';

const createData = ()=>{
  const trackingData = new FreeD();
  const t = Date.now() / 5000;
  trackingData.Pitch = 0;
  trackingData.Yaw = 0;
  trackingData.Roll = 0;
  trackingData.PosX = (Math.sin(t) + 1);
  trackingData.PosY = 0;
  trackingData.PosZ = 0;
  trackingData.Zoom = 0;
  trackingData.Focus = 0;
  return trackingData;
}

const send = ()=>{
  const trackingData = createData();
  const message = encode(trackingData);
  client.send(message, 0, message.length, PORT, HOST);
}

setInterval(() => {
  send();
}, 1000 / 60);

