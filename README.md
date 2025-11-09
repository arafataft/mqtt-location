# @arafat75/mqtt-location

A React hook package for MQTT-based real-time location tracking. This package provides an easy-to-use hook for integrating MQTT location tracking into your React applications with automatic reconnection, offline detection, and full TypeScript support.

[![npm version](https://img.shields.io/npm/v/@arafat75/mqtt-location)](https://www.npmjs.com/package/@arafat75/mqtt-location)
[![npm downloads](https://img.shields.io/npm/dm/@arafat75/mqtt-location)](https://www.npmjs.com/package/@arafat75/mqtt-location)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🎣 **Easy React Hook**: Simple `useMqttLocation` hook for location tracking
- 🔄 **Auto Reconnection**: Automatic reconnection with configurable retry periods
- 📡 **Offline Detection**: Automatically detect and mark offline devices
- 🎯 **Topic Management**: Dynamic topic subscription and switching
- 💪 **TypeScript**: Full TypeScript support with comprehensive type definitions
- 🏢 **Multi-tenant Support**: Filter by company, group, or user
- ⚡ **Optimized**: Efficient marker updates and memory management
- 📦 **Self-contained**: Bundled with mqtt.js and all necessary polyfills
- 🌐 **Browser Ready**: Works in browser environments without additional configuration

## Installation

```bash
npm install @arafat75/mqtt-location
# or
yarn add @arafat75/mqtt-location
# or
pnpm add @arafat75/mqtt-location
```

## Usage

### Basic Example

```tsx
import { useMqttLocation } from '@barikoi/mqtt-location';

function MyMap() {
  const { markers, isConnected, error } = useMqttLocation({
    config: {
      host: 'mqtt.example.com',
      port: 8083,
      username: 'your-username',
      password: 'your-password',
      protocol: 'ws',
    },
    topicConfig: {
      companyId: 'company-123',
    },
    offlineThresholdMs: 10000, // 10 seconds
  });

  if (error) return <div>Error: {error.message}</div>;
  if (!isConnected) return <div>Connecting...</div>;

  return (
    <div>
      <h2>Devices: {Object.keys(markers).length}</h2>
      {Object.values(markers).map((marker) => (
        <div key={marker.deviceId}>
          {marker.deviceId}: ({marker.latitude}, {marker.longitude})
          {marker.isOnline ? ' 🟢' : ' 🔴'}
        </div>
      ))}
    </div>
  );
}
```

### With Group Filtering

```tsx
const { markers } = useMqttLocation({
  config: mqttConfig,
  topicConfig: {
    companyId: 'company-123',
    groupId: 'group-456', // Filter by group
  },
});
```

### With User Filtering

```tsx
const { markers } = useMqttLocation({
  config: mqttConfig,
  topicConfig: {
    companyId: 'company-123',
    userId: 'user-789', // Track specific user
  },
});
```

### Custom Topic

```tsx
const { markers } = useMqttLocation({
  config: mqttConfig,
  topic: '+/+/+/+/location', // Custom MQTT topic pattern
});
```

### Dynamic Topic Switching

```tsx
function MyComponent() {
  const { markers, switchTopic } = useMqttLocation({
    config: mqttConfig,
    topicConfig: { companyId: 'company-123' },
  });

  const handleGroupChange = async (groupId: string) => {
    const newTopic = buildMqttTopic({
      companyId: 'company-123',
      groupId,
    });
    await switchTopic(newTopic);
  };

  return <GroupSelector onChange={handleGroupChange} />;
}
```

### With Event Callbacks

```tsx
const { markers } = useMqttLocation({
  config: mqttConfig,
  topicConfig: { companyId: 'company-123' },
  onConnect: () => console.log('Connected!'),
  onDisconnect: () => console.log('Disconnected!'),
  onError: (error) => console.error('Error:', error),
  onMessage: (topic, message) => {
    console.log('Message received:', topic, message);
  },
});
```

## API Reference

### `useMqttLocation(options)`

Main hook for MQTT location tracking.

#### Options

```typescript
interface UseMqttLocationOptions {
  config: MqttConnectionConfig;
  topic?: string;
  topicConfig?: TopicConfig;
  offlineThresholdMs?: number;
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  onMessage?: (topic: string, message: MqttLocationMessage) => void;
}
```

#### Returns

```typescript
interface UseMqttLocationReturn {
  markers: Record<string, MqttMarker>;
  client: MqttClient | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
  connect: () => void;
  disconnect: () => void;
  subscribe: (topic: string) => Promise<void>;
  unsubscribe: (topic: string) => Promise<void>;
  switchTopic: (newTopic: string) => Promise<void>;
  clearMarkers: () => void;
}
```

### Utility Functions

#### `buildMqttTopic(config: TopicConfig): string`

Build MQTT topic from configuration.

```typescript
const topic = buildMqttTopic({
  companyId: 'company-123',
  groupId: 'group-456',
  userId: 'user-789',
});
// Returns: "company/company-123/group-456/user-789/location"
```

#### `parseLocationMessage(message: Buffer | string, topic: string): MqttMarker | null`

Parse MQTT message into marker object.

#### `checkOfflineDevices(markers: Record<string, MqttMarker>, thresholdMs: number): Record<string, MqttMarker>`

Check and update offline status of devices.

#### Topic Parsers

- `parseTopicGroupId(topic: string): string | null`
- `parseTopicCompanyId(topic: string): string | null`
- `parseTopicUserId(topic: string): string | null`

## Types

### `MqttMarker`

```typescript
interface MqttMarker {
  deviceId: string;
  latitude: number;
  longitude: number;
  speed?: number;
  altitude?: number;
  accuracy?: number;
  timestamp: number;
  isOnline: boolean;
  groupId?: string;
  companyId?: string;
}
```

### `MqttLocationMessage`

```typescript
interface MqttLocationMessage {
  device_id?: string;
  user_id?: string;
  latitude: number | string;
  longitude: number | string;
  speed?: number | string;
  altitude?: number | string;
  accuracy?: number | string;
  timestamp?: number | string;
}
```

## Topic Structure

The package uses the following topic structure:

```
company/{companyId}/{groupId}/{userId}/location
```

- **All company users**: `company/{companyId}/+/+/location`
- **Group users**: `company/{companyId}/{groupId}/+/location`
- **Specific user**: `company/{companyId}/+/{userId}/location`

## Configuration

### Environment Variables

```env
MQTT_HOST=mqtt.example.com
MQTT_PORT=8083
MQTT_USERNAME=username
MQTT_PASSWORD=password
```

### Default Values

- **Offline Threshold**: 10 seconds
- **Reconnect Period**: 1 second
- **Connect Timeout**: 4 seconds
- **QoS Level**: 0
- **Protocol**: WebSocket (ws)

## Browser Support

This package works in all modern browsers that support WebSockets:
- Chrome/Edge 88+
- Firefox 78+
- Safari 14+
- Opera 74+

## Troubleshooting

### Connection Issues

If you're having trouble connecting to the MQTT broker:

1. **Check WebSocket URL**: Ensure the broker URL uses `ws://` or `wss://` protocol
2. **Verify Credentials**: Confirm username and password are correct
3. **Check Network**: Ensure the broker is accessible from your network
4. **Firewall**: Verify port (usually 8083 for WebSocket) is not blocked

### TypeScript Errors

If you encounter TypeScript errors, ensure you're using TypeScript 4.0 or higher:

```bash
npm install -D typescript@latest
```

## Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/arafataft/mqtt-location.git
cd mqtt-location

# Install dependencies
npm install

# Build the package
npm run build

# Watch mode for development
npm run dev
```

### Publishing

```bash
# Update version in package.json
npm version patch|minor|major

# Build and publish
npm run build
npm publish --access public
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Links

- 📦 [npm Package](https://www.npmjs.com/package/@arafat75/mqtt-location)
- 🐙 [GitHub Repository](https://github.com/arafataft/mqtt-location)
- 📝 [Changelog](https://github.com/arafataft/mqtt-location/releases)
- 🐛 [Report Issues](https://github.com/arafataft/mqtt-location/issues)

## Author

**Md. Arafat Hossain**
- Email: arafataft7@gmail.com
- GitHub: [@arafataft](https://github.com/arafataft)

## License

MIT

## Author

Barikoi
