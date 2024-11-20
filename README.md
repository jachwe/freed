# freeD

## A simple freeD tracking protocol implementation written in Node.js

### What is freeD?

freeD is a simple protocol used to exchange camera tracking data. It was originally developed by BBC R&D and is now supported by a wide range of hardware and software, including Unreal Engine, disguise, stYpe, Mo-Sys, and Panasonic.

You can find some documentation by Vinten that includes a deeper look into the protocol here:  
[https://www.manualsdir.com/manuals/641433/vinten-radamec-free-d.html](https://www.manualsdir.com/manuals/641433/vinten-radamec-free-d.html)

Note that the original system is designed to transmit its data via RS232 or RS422. See manual section A.3 to get a detailed look at what's going on.

If you need support or have ideas to improve this library, feel free to reach out!

---

## Install

```bash
npm install freeD
```

## Functions

### `decode()`

The `decode` function takes a byte array (typically received via UDP nowadays), parses the data, and returns a `FreeD` object. If the internal checksum validation fails, an error is thrown.

### `encode()`

The `encode` function takes a `FreeD` object, generates a byte array in the freeD format, and returns it. This array can then be transmitted via UDP.

---

## FreeD Class

The `FreeD` class is used to represent the tracking data.

```javascript
class FreeD {
  constructor() {
    this.Pitch = 0.0; // Camera pitch angle in degrees
    this.Yaw = 0.0;   // Camera yaw angle in degrees
    this.Roll = 0.0;  // Camera roll angle in degrees
    this.PosZ = 0.0;  // Camera Z offset from origin in millimeters
    this.PosX = 0.0;  // Camera X offset from origin in millimeters
    this.PosY = 0.0;  // Camera Y offset from origin in millimeters
    this.Zoom = 0;    // Lens zoom position (0-4095)
    this.Focus = 0;   // Lens focus position (0-4095)
  }
}
```


## FreeD Protocol

A typical freeD package contains 29 bytes:

| Offset  | Function          | Description                                                                                             |
|---------|-------------------|---------------------------------------------------------------------------------------------------------|
| 0       | Identifier        | Message type. The `encode` function always uses `0xD1` (see freeD manual section A.3.1 for more details). |
| 1       | ID                | Camera ID. This is a relic from using multiple systems via RS232 or RS422.                              |
| 2:5     | Pitch             | Camera pitch angle in degrees.                                                                         |
| 5:8     | Yaw               | Camera yaw angle in degrees.                                                                           |
| 8:11    | Roll              | Camera roll angle in degrees.                                                                          |
| 11:14   | Position Z        | Camera Z offset from origin, typically in millimeters.                                                 |
| 14:17   | Position Y        | Camera Y offset from origin, typically in millimeters.                                                 |
| 17:20   | Position X        | Camera X offset from origin, typically in millimeters.                                                 |
| 20:23   | Zoom              | Lens zoom position. Typically measured with an external encoder attached to the lens. In most cases, this is a value between 0-4095. |
| 23:26   | Focus             | Lens focus position. Typically measured with an external encoder attached to the lens. In most cases, this is a value between 0-4095. |
| 26:28   | Reserved          | Currently not used in freeD.                                                                           |
| 28      | Checksum          | Checksum of the first 28 bytes. The `decode` function uses this to verify if the incoming data is a valid freeD package. |

---

## Example Usage

### Sending FreeD Data

This example demonstrates how to encode and send freeD data via UDP.

```javascript
const dgram = require('dgram');
const { FreeD, encode } = require('freeD');

const udpClient = dgram.createSocket('udp4');

const trackingData = new FreeD();
trackingData.Pitch = 1.257782;
trackingData.Yaw = 12.214172;
trackingData.Roll = 0.005371;
trackingData.PosX = 2532.87;
trackingData.PosY = 3274.1094;
trackingData.PosZ = 1014.3281;
trackingData.Zoom = 534;
trackingData.Focus = 1127;

const encodedData = encode(trackingData);

udpClient.send(encodedData, 6301, '127.0.0.1', (err) => {
  if (err) {
    console.error('Error sending data:', err);
  } else {
    console.log('FreeD data sent successfully.');
  }
  udpClient.close();
});
```


### Receiving FreeD Data

This example demonstrates how to receive and decode freeD data via UDP.

```javascript
const dgram = require('dgram');
const { decode } = require('freeD');

const udpServer = dgram.createSocket('udp4');

udpServer.on('message', (msg) => {
  try {
    const trackingData = decode(msg);
    console.log('Received FreeD data:', trackingData);
  } catch (err) {
    console.error('Failed to decode FreeD data:', err.message);
  }
});

udpServer.bind(6301, () => {
  console.log('Listening for FreeD data on port 6301');
});
```


### References

This is an node.js port of the golang lib at https://github.com/stvmyr/freeD