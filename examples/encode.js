const dgram = require('dgram');
const { FreeD, encode } = require('../index');

// Configuration
const PORT = 6301;
const HOST = '127.0.0.1';

// Tracking data
const trackingData = new FreeD();
trackingData.Pitch = 1.257782;
trackingData.Yaw = 12.214172;
trackingData.Roll = 0.005371;
trackingData.PosX = 2532.87;
trackingData.PosY = 3274.1094;
trackingData.PosZ = 1014.3281;
trackingData.Zoom = 534;
trackingData.Focus = 1127;

// Create UDP client
const client = dgram.createSocket('udp4');

// Encode tracking data and send it
const message = encode(trackingData);

client.send(message, 0, message.length, PORT, HOST, (err) => {
  if (err) {
    console.error('Error sending data:', err);
  } else {
    console.log('Tracking data sent successfully.');
  }
  client.close();
});
