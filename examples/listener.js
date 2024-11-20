const dgram = require('dgram');
const { decode } = require('../index.js');

const PORT = 6301;
const server = dgram.createSocket('udp4');
const buffer = Buffer.alloc(1024);

server.on('message', (msg, rinfo) => {
  try {
    const trackingData = decode(msg);
    console.log('Tracking Data:', trackingData);
  } catch (err) {
    console.error('Error decoding data:', err.message);
  }
});

server.on('error', (err) => {
  console.error('Server error:', err.message);
  server.close();
});

server.bind(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
