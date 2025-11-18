# MQTT Location Tracker for Barikoi Trace

A production-ready React hook for real-time device location tracking using MQTT with Barikoi Trace. Build live tracking dashboards, fleet management apps, and location monitoring systems with zero configuration.

[![npm version](https://img.shields.io/npm/v/@arafat75/mqtt-location)](https://www.npmjs.com/package/@arafat75/mqtt-location)
[![npm downloads](https://img.shields.io/npm/dm/@arafat75/mqtt-location)](https://www.npmjs.com/package/@arafat75/mqtt-location)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/license/mit)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)](https://www.typescriptlang.org/)

---

## Key Features

### MQTT + React Integration

- **Real-time Location Streaming** - WebSocket-based MQTT for instant updates
- **Auto-Reconnection** - Resilient connection with exponential backoff
- **Smart Topic Filtering** - Company, group, or device-level subscriptions
- **State Management** - React hooks with automatic marker updates
- **Offline Detection** - Know when devices stop transmitting
- **Zero Configuration** - Works out-of-the-box with any MQTT broker

### Technical Capabilities

- **MQTT Protocol Support** - WebSocket (ws://, wss://) and native MQTT
- **Topic Wildcards** - Full support for `+` wildcards in subscriptions
- **Message Parsing** - Automatic normalization of location payloads
- **TypeScript First** - Complete type definitions included
- **React 18 & 19** - Full support for modern React features
- **Modular Architecture** - Clean separation: Hooks → Utils → Types

---

## Prerequisites

- **Node.js** >= 16.0.0
- **React** >= 18.0.0 or 19.0.0
- **Barikoi Trace** backend integration
- **MQTT Broker** with WebSocket support (ws:// or wss://)
- Broker credentials (host, port, username, password)

> **How it works:** Barikoi Trace backend publishes location data to your MQTT broker, and this React hook subscribes to receive live updates and display device locations in real-time.

---

## Quick Start

### 1. Install the package

```bash
npm install @arafat75/mqtt-location
# or
yarn add @arafat75/mqtt-location
# or
pnpm add @arafat75/mqtt-location
```

### 2. Import and use

```tsx
import { useMqttLocation } from '@arafat75/mqtt-location';
```

### 3. You're ready to track!

That's it! No additional configuration or polyfills needed. The package includes everything for browser compatibility.

---

## Basic Usage

Here's a complete example that displays real-time device locations:

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

## Architecture

### How It Works

1. **MQTT Connection** - Hook establishes WebSocket connection to your broker
2. **Topic Subscription** - Subscribes to location topics with wildcard support
3. **Message Processing** - Incoming MQTT messages parsed and normalized
4. **State Updates** - React state automatically updated with new locations
5. **Offline Detection** - Background task marks inactive devices as offline

### Technical Stack

- **React 18+** - Modern hooks-based API
- **TypeScript 5.8** - Full type safety
- **MQTT.js 5.14** - Industry-standard MQTT client
- **tsup** - Fast TypeScript bundler with tree-shaking
- **ESM + CJS** - Works in any JavaScript environment

### Data Flow

```
Mobile App/Device → Barikoi Trace Backend → MQTT Broker → WebSocket → useMqttLocation Hook
                                                                              ↓
                                                                      Message Parser
                                                                              ↓
                                                                      React State (markers)
                                                                              ↓
                                                                      Your UI Components
```

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

### Example 3: Handle Connection Events

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

### Example 4: Switch Topics Dynamically

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

### Example 5: Integration with Barikoi Maps

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

## Project Structure

```
src/
├── index.ts                    # Main exports
├── hooks/
│   └── useMqttLocation.ts      # Core React hook with MQTT integration
├── utils/
│   └── index.ts                # Utility functions
│       ├── buildMqttTopic()    # Topic string builder
│       ├── buildMqttUri()      # Broker URI constructor
│       ├── parseLocationMessage() # Message parser & normalizer
│       ├── checkOfflineDevices() # Offline detection
│       ├── switchMqttSubscription() # Dynamic topic switching
│       └── Topic parsers       # Extract IDs from topics
└── types/
    └── index.ts                # TypeScript definitions
        ├── MqttMarker          # Normalized location data
        ├── MqttConnectionConfig # Connection settings
        ├── TopicConfig         # Topic builder config
        └── UseMqttLocationOptions # Hook configuration
```

### Module Breakdown

- **Hooks Layer** - React integration with state management
- **MQTT Client Layer** - Connection management and message handling  
- **Utils Layer** - Pure functions for data transformation
- **Types Layer** - TypeScript definitions for type safety

---

## API Reference

### `useMqttLocation(options)`

The main hook for tracking locations.

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `config` | `MqttConnectionConfig` | Yes | - | MQTT broker connection details |
| `topicConfig` | `TopicConfig` | Yes* | - | Topic configuration for company/group/user filtering |
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

## Barikoi Trace Topic Structure

This package is configured for Barikoi Trace's MQTT topic format:

```
company/{companyId}/{groupId}/{userId}/location
```

### Topic Filtering Options

- **All company devices:** `company/123/+/+/location`
- **Specific group:** `company/123/fleet-a/+/location`
- **Specific user:** `company/123/+/driver-001/location`

### Location Message Format

Barikoi Trace publishes location data in this JSON format:

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

### 1. Filter Topics Wisely

Don't subscribe to more than you need:

```tsx
// Too broad - gets all devices
topicConfig: { companyId: 'company-123' }

// Better - gets only one group
topicConfig: { companyId: 'company-123', groupId: 'fleet-a' }
```

### 2. Adjust Offline Threshold

Match your device update frequency:

```tsx
// Devices update every 30s? Use 60s threshold
offlineThresholdMs: 60000
```

### 3. Optimize Rendering

Use `React.memo` for marker components:

```tsx
const DeviceMarker = React.memo(({ marker }) => (
  <Marker position={[marker.latitude, marker.longitude]} />
));
```

---

## Contributing

Contributions are welcome! Whether it's bug fixes, feature requests, or documentation improvements, we appreciate your help.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/arafataft/mqtt-location.git
cd mqtt-location/packages/mqtt-location

# Install dependencies
npm install

# Start development mode (watch mode)
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

### How to Contribute

1. **Fork the repository** on GitHub
2. **Create a feature branch** (`git checkout -b feature/awesome-feature`)
3. **Make your changes** with clear, descriptive commits
4. **Write or update tests** if applicable
5. **Update documentation** if you're changing functionality
6. **Push to your fork** (`git push origin feature/awesome-feature`)
7. **Open a Pull Request** with a clear title and description

### Contribution Guidelines

- Follow existing code style and conventions
- Write meaningful commit messages
- Add tests for new features
- Update README.md for API changes
- Be respectful and constructive in discussions

By contributing to this project, you agree that your contributions will be licensed under the MIT License alongside the original project. Contributors retain copyright to their contributions and are added to the list of contributors.

---

## Resources & Documentation

### Package & Repository

- [npm Package](https://www.npmjs.com/package/@arafat75/mqtt-location) - Install and version history
- [GitHub Repository](https://github.com/arafataft/mqtt-location) - Source code and examples
- [Report Issues](https://github.com/arafataft/mqtt-location/issues) - Bug reports and feature requests
- [Changelog](https://github.com/arafataft/mqtt-location/releases) - Release notes and updates

### MQTT Resources

- [MQTT Protocol](https://mqtt.org/) - Official MQTT specification
- [MQTT.js Documentation](https://github.com/mqttjs/MQTT.js) - JavaScript MQTT client library
- [HiveMQ](https://www.hivemq.com/) - Popular MQTT broker with free tier
- [Eclipse Mosquitto](https://mosquitto.org/) - Open-source MQTT broker

### React & TypeScript

- [React Documentation](https://react.dev/) - Official React docs
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - TypeScript documentation
- [React Hooks Guide](https://react.dev/reference/react) - React hooks reference

---

## License

This project is licensed under the MIT License - see below for details:

```
MIT License

Copyright (c) 2024 Md. Arafat Hossan and contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### Attribution

When using this project, please provide attribution by:

1. Including the copyright notice in your project
2. Linking back to this repository
3. Mentioning the use of the MQTT.js library for MQTT connectivity

---

## Support

Found this helpful? Give it a star on [GitHub](https://github.com/arafataft/mqtt-location)!

### Get Help

- **Email:** arafataft7@gmail.com
- **GitHub:** [@arafataft](https://github.com/arafataft)
- **Issues:** [Report a bug](https://github.com/arafataft/mqtt-location/issues)
- **Discussions:** [Ask questions](https://github.com/arafataft/mqtt-location/discussions)

### Stay Updated

- **Watch** the repository for updates
- **Star** to show your support
- **Follow** [@arafataft](https://github.com/arafataft) for more projects

---

**Built with care for the real-time tracking and React community**
