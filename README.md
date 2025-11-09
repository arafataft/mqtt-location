# @arafat75/mqtt-location

A simple React hook for tracking real-time device locations using MQTT. Perfect for building live tracking dashboards, fleet management apps, or any application that needs to display moving markers on a map.

[![npm version](https://img.shields.io/npm/v/@arafat75/mqtt-location)](https://www.npmjs.com/package/@arafat75/mqtt-location)
[![npm downloads](https://img.shields.io/npm/dm/@arafat75/mqtt-location)](https://www.npmjs.com/package/@arafat75/mqtt-location)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/license/mit)

---

## Table of Contents

- [Why Use This?](#why-use-this)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Bundle Options](#bundle-options)
- [Complete Examples](#complete-examples)
- [API Reference](#api-reference)
- [TypeScript Support](#typescript-support)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## Why Use This?

Building a live location tracking app can be complex. This package handles:

- **MQTT Connection** - Connects to your broker with auto-reconnect
- **Location Updates** - Automatically updates when devices send new positions
- **Offline Detection** - Know when devices stop sending data
- **Topic Management** - Filter by company, group, or specific users
- **TypeScript** - Full type safety included

**You just focus on displaying the data—we handle everything else.**

---

## Quick Start

### What You Need

1. A React project (React 18 or 19)
2. An MQTT broker with WebSocket support (`ws://` or `wss://`)
3. Broker credentials (host, port, username, password)

> **New to MQTT?** Think of it like a messaging system where devices send their location, and your app listens for updates in real-time.

---

## Installation

### Step 1: Install the Package

```bash
npm install @arafat75/mqtt-location
```

### Step 2: You're Ready!

That's it! The default bundle includes everything you need.

---

## Basic Usage

Here's a complete example that displays a list of devices with their locations:

```tsx
import React from 'react';
import { useMqttLocation } from '@arafat75/mqtt-location';

function DeviceTracker() {
  const { markers, isConnected, error } = useMqttLocation({
    config: {
      host: 'mqtt.example.com',    // Your MQTT broker
      port: 8083,                    // WebSocket port (usually 8083)
      username: 'your-username',     // Your credentials
      password: 'your-password',
      protocol: 'ws',                // 'ws' or 'wss' for secure
    },
    topicConfig: {
      companyId: 'company-123',      // Your company/tenant ID
    },
    offlineThresholdMs: 10000,       // Mark offline after 10 seconds
  });

  // Show errors
  if (error) {
    return <div>Error: {error.message}</div>;
  }

  // Show loading state
  if (!isConnected) {
    return <div>Connecting to MQTT broker...</div>;
  }

  // Show devices
  return (
    <div>
      <h2>Live Device Tracking ({Object.keys(markers).length} devices)</h2>
      <ul>
        {Object.values(markers).map((marker) => (
          <li key={marker.deviceId}>
            <strong>{marker.deviceId}</strong>
            <br />
            Location: {marker.latitude.toFixed(5)}, {marker.longitude.toFixed(5)}
            <br />
            Status: {marker.isOnline ? 'Online' : 'Offline'}
            {marker.speed && <span> · Speed: {marker.speed} km/h</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DeviceTracker;
```

**That's it!** This example connects to your MQTT broker and displays all devices with their real-time locations.

---

## Bundle Options

We offer **two versions** of this package:

### Full Bundle (Default) - Recommended

**What:** Everything included in one package  
**Size:** ~450 KB  
**When to use:** Just starting out, quick prototypes, or don't care about bundle size

```tsx
import { useMqttLocation } from '@arafat75/mqtt-location';
```

- No extra setup required  
- Works immediately after `npm install`  
- Perfect for learning and prototyping

---

### Lite Bundle - For Production Optimization

**What:** Smaller version that requires separate MQTT installation  
**Size:** ~5 KB (99% smaller!)  
**When to use:** Production apps where bundle size matters

#### How to Use Lite Bundle:

**Step 1:** Install additional dependencies

```bash
npm install @arafat75/mqtt-location mqtt
```

**Step 2:** Change your import (add `/lite`)

```tsx
// Before (Full Bundle)
import { useMqttLocation } from '@arafat75/mqtt-location';

// After (Lite Bundle)
import { useMqttLocation } from '@arafat75/mqtt-location/lite';
```

**Step 3:** Configure your bundler (choose one):

<details>
<summary><strong>Vite Configuration</strong></summary>

```bash
npm install vite-plugin-node-polyfills --save-dev
```

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    nodePolyfills({
      include: ['buffer', 'process', 'stream', 'events'],
    }),
  ],
});
```

</details>

<details>
<summary><strong>Webpack 5 Configuration</strong></summary>

```js
// webpack.config.js
const webpack = require('webpack');

module.exports = {
  resolve: {
    fallback: {
      buffer: require.resolve('buffer/'),
      stream: require.resolve('stream-browserify'),
      events: require.resolve('events/'),
      process: require.resolve('process/browser'),
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
  ],
};
```

</details>

<details>
<summary><strong>Next.js Configuration</strong></summary>

```js
// next.config.js
module.exports = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      buffer: require.resolve('buffer/'),
      stream: require.resolve('stream-browserify'),
      events: require.resolve('events/'),
    };
    return config;
  },
};
```

</details>

**Important:** The API is identical for both bundles. Only the import path and setup differ!

---

## Complete Examples

### Example 1: Filter by Group

Track only devices in a specific group:

```tsx
const { markers } = useMqttLocation({
  config: mqttConfig,
  topicConfig: {
    companyId: 'company-123',
    groupId: 'fleet-a',  // Only show devices in fleet-a
  },
});
```

### Example 2: Track a Single Device

Monitor one specific device:

```tsx
const { markers } = useMqttLocation({
  config: mqttConfig,
  topicConfig: {
    companyId: 'company-123',
    userId: 'driver-001',  // Only track this user
  },
});
```

### Example 3: Custom Topic Pattern

Use your own MQTT topic structure:

```tsx
const { markers } = useMqttLocation({
  config: mqttConfig,
  topic: 'company/+/+/+/location',  // Custom topic pattern
});
```

### Example 4: Handle Connection Events

Get notified about connection status:

```tsx
const { markers, isConnected } = useMqttLocation({
  config: mqttConfig,
  topicConfig: { companyId: 'company-123' },
  onConnect: () => {
    console.log('Connected to MQTT!');
  },
  onDisconnect: () => {
    console.log('Disconnected from MQTT');
  },
  onError: (error) => {
    console.error('MQTT Error:', error);
  },
  onMessage: (topic, message) => {
    console.log('New message:', topic, message);
  },
});
```

### Example 5: Switch Topics Dynamically

Change what you're tracking without reconnecting:

```tsx
import { useMqttLocation, buildMqttTopic } from '@arafat75/mqtt-location';

function DynamicTracker() {
  const [selectedGroup, setSelectedGroup] = useState('fleet-a');
  const { markers, switchTopic } = useMqttLocation({
    config: mqttConfig,
    topicConfig: { companyId: 'company-123', groupId: selectedGroup },
  });

  const handleGroupChange = async (newGroup) => {
    setSelectedGroup(newGroup);
    const newTopic = buildMqttTopic({
      companyId: 'company-123',
      groupId: newGroup,
    });
    await switchTopic(newTopic);
  };

  return (
    <div>
      <select value={selectedGroup} onChange={(e) => handleGroupChange(e.target.value)}>
        <option value="fleet-a">Fleet A</option>
        <option value="fleet-b">Fleet B</option>
        <option value="fleet-c">Fleet C</option>
      </select>
      {/* Display markers */}
    </div>
  );
}
```

### Example 6: Integration with Barikoi Maps

Use with Barikoi's map library for real-time location tracking:

```tsx
import { useRef } from 'react';
import { Map, Marker, Popup } from 'react-bkoi-gl';
import { useMqttLocation } from '@arafat75/mqtt-location';
import 'react-bkoi-gl/styles';

function LiveMap() {
  const BARIKOI_API_KEY = 'YOUR_BARIKOI_API_KEY_HERE';
  const mapStyle = `https://map.barikoi.com/styles/osm-liberty/style.json?key=${BARIKOI_API_KEY}`;
  const mapRef = useRef(null);

  const { markers } = useMqttLocation({
    config: mqttConfig,
    topicConfig: { companyId: 'company-123' },
  });

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Map
        ref={mapRef}
        mapStyle={mapStyle}
        style={{ width: '100%', height: '100%' }}
        initialViewState={{
          longitude: 90.36402,
          latitude: 23.823731,
          zoom: 13,
        }}
      >
        {Object.values(markers).map((marker) => (
          <div key={marker.deviceId}>
            <Marker 
              longitude={marker.longitude} 
              latitude={marker.latitude}
              color={marker.isOnline ? 'green' : 'red'}
            />
            <Popup 
              longitude={marker.longitude} 
              latitude={marker.latitude}
            >
              <div>
                <strong>{marker.deviceId}</strong>
                <br />
                Status: {marker.isOnline ? 'Online' : 'Offline'}
                {marker.speed && <><br />Speed: {marker.speed} km/h</>}
              </div>
            </Popup>
          </div>
        ))}
      </Map>
    </div>
  );
}
```

---

## API Reference

### `useMqttLocation(options)`

The main hook for tracking locations.

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `config` | `MqttConnectionConfig` | Yes | - | MQTT broker connection details |
| `topicConfig` | `TopicConfig` | No | - | Topic builder for company/group/user filtering |
| `topic` | `string` | No | `''` | Custom MQTT topic (overrides topicConfig) |
| `offlineThresholdMs` | `number` | No | `10000` | Milliseconds before marking device offline |
| `autoConnect` | `boolean` | No | `true` | Connect automatically on mount |
| `onConnect` | `function` | No | - | Callback when connected |
| `onDisconnect` | `function` | No | - | Callback when disconnected |
| `onError` | `function` | No | - | Callback for errors |
| `onMessage` | `function` | No | - | Callback for raw messages |

#### Returns

```typescript
{
  markers: Record<string, MqttMarker>;  // All tracked devices
  client: MqttClient | null;             // MQTT client instance
  isConnected: boolean;                  // Connection status
  isConnecting: boolean;                 // Connecting status
  error: Error | null;                   // Last error if any
  connect: () => void;                   // Manually connect
  disconnect: () => void;                // Manually disconnect
  subscribe: (topic: string) => Promise<void>;    // Subscribe to topic
  unsubscribe: (topic: string) => Promise<void>;  // Unsubscribe from topic
  switchTopic: (newTopic: string) => Promise<void>; // Switch subscriptions
  clearMarkers: () => void;              // Clear all markers
}
```

### Configuration Types

#### `MqttConnectionConfig`

```typescript
{
  host: string;              // MQTT broker hostname
  port: number | string;     // WebSocket port (usually 8083)
  username: string;          // Broker username
  password: string;          // Broker password
  protocol?: 'ws' | 'wss' | 'mqtt' | 'mqtts';  // Default: 'ws'
  clientIdPrefix?: string;   // Prefix for generated client IDs
  reconnectPeriod?: number;  // Reconnect delay in ms (default: 1000)
  connectTimeout?: number;   // Connection timeout in ms (default: 4000)
  clean?: boolean;           // Clean session flag (default: true)
}
```

#### `TopicConfig`

```typescript
{
  companyId: string;         // Your company/tenant ID
  groupId?: string | null;   // Optional group filter
  userId?: string | null;    // Optional user filter
}
```

#### `MqttMarker`

```typescript
{
  deviceId: string;          // Unique device identifier
  latitude: number;          // Device latitude
  longitude: number;         // Device longitude
  speed?: number;            // Speed in km/h (if available)
  altitude?: number;         // Altitude in meters (if available)
  accuracy?: number;         // GPS accuracy in meters (if available)
  timestamp: number;         // Last update timestamp
  isOnline: boolean;         // Online/offline status
  groupId?: string;          // Extracted from topic
  companyId?: string;        // Extracted from topic
}
```

### Utility Functions

All utilities are exported and can be used independently:

#### `buildMqttTopic(config: TopicConfig): string`

Build MQTT topic from configuration.

```typescript
import { buildMqttTopic } from '@arafat75/mqtt-location';

const topic = buildMqttTopic({
  companyId: 'company-123',
  groupId: 'fleet-a',
});
// Returns: "company/company-123/fleet-a/+/location"
```

#### `parseLocationMessage(message: Buffer | string, topic: string): MqttMarker | null`

Parse MQTT message into marker object.

```typescript
import { parseLocationMessage } from '@arafat75/mqtt-location';

const marker = parseLocationMessage(messageBuffer, topic);
```

#### `checkOfflineDevices(markers: Record<string, MqttMarker>, thresholdMs: number)`

Update offline status based on timestamp.

```typescript
import { checkOfflineDevices } from '@arafat75/mqtt-location';

const updatedMarkers = checkOfflineDevices(markers, 10000);
```

#### Topic Parsers

Extract information from MQTT topics:

```typescript
import {
  parseTopicCompanyId,
  parseTopicGroupId,
  parseTopicUserId,
} from '@arafat75/mqtt-location';

const companyId = parseTopicCompanyId('company/123/fleet-a/driver-1/location');
// Returns: '123'

const groupId = parseTopicGroupId('company/123/fleet-a/driver-1/location');
// Returns: 'fleet-a'

const userId = parseTopicUserId('company/123/fleet-a/driver-1/location');
// Returns: 'driver-1'
```

---

## TypeScript Support

This package is written in TypeScript and includes full type definitions.

### Import Types

```typescript
import type {
  MqttMarker,
  MqttConnectionConfig,
  TopicConfig,
  UseMqttLocationOptions,
  UseMqttLocationReturn,
  MqttLocationMessage,
} from '@arafat75/mqtt-location';
```

### Type-Safe Configuration

```typescript
import { useMqttLocation } from '@arafat75/mqtt-location';
import type { MqttConnectionConfig, TopicConfig } from '@arafat75/mqtt-location';

const config: MqttConnectionConfig = {
  host: 'mqtt.example.com',
  port: 8083,
  username: 'user',
  password: 'pass',
  protocol: 'ws',
};

const topicConfig: TopicConfig = {
  companyId: 'company-123',
  groupId: 'fleet-a',
};

const { markers } = useMqttLocation({ config, topicConfig });
```

---

## Troubleshooting

### Common Issues and Solutions

#### "Cannot connect to broker"

**Problem:** Connection fails or times out

**Solutions:**
1. Verify your broker URL uses `ws://` (not `http://`)
2. Check the port is correct (usually `8083` for WebSocket)
3. Confirm username and password are correct
4. Ensure your broker is accessible from your network
5. Check if the broker requires SSL (`wss://` instead of `ws://`)

```tsx
// Correct
config: {
  host: 'mqtt.example.com',
  port: 8083,
  protocol: 'ws',
}

// Wrong
config: {
  host: 'http://mqtt.example.com',  // Don't include protocol
  port: 1883,  // Wrong port for WebSocket
}
```

#### "No markers appearing"

**Problem:** Connected but no devices showing

**Solutions:**
1. Check your topic matches what devices are publishing to
2. Verify `companyId` matches your data
3. Look for errors in browser console
4. Test with a wildcard topic: `company/+/+/+/location`

```tsx
// Debug with message callback
onMessage: (topic, message) => {
  console.log('Received:', topic, message);
}
```

#### "Devices showing as offline incorrectly"

**Problem:** Online devices marked offline

**Solutions:**
1. Increase `offlineThresholdMs` to match device publish frequency
2. Check device is publishing regularly
3. Verify timestamps in messages are recent

```tsx
// If devices publish every 30 seconds, use 60 second threshold
offlineThresholdMs: 60000
```

#### Using Lite Bundle: "Cannot find module 'mqtt'"

**Problem:** Lite bundle can't find MQTT

**Solution:** Install mqtt separately

```bash
npm install mqtt
```

#### Using Lite Bundle: "Buffer is not defined"

**Problem:** Missing Node.js polyfills

**Solution:** Configure your bundler (see [Lite Bundle section](#lite-bundle---for-production-optimization))

#### TypeScript errors about types

**Problem:** Type definitions not found

**Solutions:**
1. Ensure TypeScript version is 4.0 or higher
2. Clear `node_modules` and reinstall
3. Check `tsconfig.json` includes `"node_modules/@arafat75"`

```bash
npm install typescript@latest --save-dev
```

### Getting Help

If you're still stuck:

1. Check the [GitHub Issues](https://github.com/arafataft/mqtt-location/issues)
2. Create a new issue with:
   - Your code example
   - Error messages
   - Package version
   - React version
   - Bundler (Vite, Webpack, etc.)

---

## MQTT Topic Structure

This package expects location messages on topics following this pattern:

```
company/{companyId}/{groupId}/{userId}/location
```

### Topic Patterns

- **All company devices:** `company/123/+/+/location`
- **Specific group:** `company/123/fleet-a/+/location`
- **Specific user:** `company/123/+/driver-001/location`

### Message Format

Your devices should publish JSON messages like:

```json
{
  "device_id": "device-001",
  "latitude": 23.8103,
  "longitude": 90.4125,
  "speed": 45.5,
  "altitude": 12.3,
  "accuracy": 10.0,
  "timestamp": 1699531200000
}
```

**Minimum required fields:**
- `latitude` (number)
- `longitude` (number)

**Optional fields:**
- `device_id` or `user_id` (string) - defaults to "unknown-device"
- `speed` (number) - vehicle speed
- `altitude` (number) - elevation
- `accuracy` (number) - GPS accuracy
- `timestamp` (number) - Unix timestamp

---

## Performance Tips

### 1. Use Lite Bundle in Production

The lite bundle is 99% smaller:

```bash
npm install @arafat75/mqtt-location mqtt
```

```tsx
import { useMqttLocation } from '@arafat75/mqtt-location/lite';
```

### 2. Filter Topics Wisely

Don't subscribe to more than you need:

```tsx
// Too broad - gets all devices
topicConfig: { companyId: 'company-123' }

// Better - gets only one group
topicConfig: { companyId: 'company-123', groupId: 'fleet-a' }
```

### 3. Adjust Offline Threshold

Match your device update frequency:

```tsx
// Devices update every 30s? Use 60s threshold
offlineThresholdMs: 60000
```

### 4. Optimize Rendering

Use `React.memo` for marker components:

```tsx
const DeviceMarker = React.memo(({ marker }) => (
  <Marker position={[marker.latitude, marker.longitude]} />
));
```

---

## Contributing

We welcome contributions! Here's how:

### Development Setup

```bash
# Clone repository
git clone https://github.com/arafataft/mqtt-location.git
cd mqtt-location/packages/mqtt-location

# Install dependencies
npm install

# Start development build
npm run dev

# Build for production
npm run build
```

### Running Tests

```bash
npm test
```

### Submit Changes

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Resources

- **npm Package:** https://www.npmjs.com/package/@arafat75/mqtt-location
- **GitHub Repository:** https://github.com/arafataft/mqtt-location
- **Report Issues:** https://github.com/arafataft/mqtt-location/issues
- **Changelog:** https://github.com/arafataft/mqtt-location/releases

---

## License

MIT © [Md. Arafat Hossain](https://github.com/arafataft)

---

## Support

Found this helpful? Give it a star on [GitHub](https://github.com/arafataft/mqtt-location)!

**Need help?** Open an issue or reach out:
- Email: arafataft7@gmail.com
- GitHub: [@arafataft](https://github.com/arafataft)
