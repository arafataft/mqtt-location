# @barikoi/mqtt-location

MQTT location tracking package for Barikoi projects. This package provides React hooks and utilities for easily integrating MQTT-based real-time location tracking into your applications.

## Features

- 🎣 **React Hook**: Easy-to-use `useMqttLocation` hook
- 🔄 **Auto Reconnection**: Automatic reconnection with configurable retry
- 📡 **Offline Detection**: Automatically detect and mark offline devices
- 🎯 **Topic Management**: Dynamic topic subscription and switching
- 💪 **TypeScript**: Full TypeScript support with type definitions
- 🏢 **Multi-tenant**: Support for company/group/user filtering
- ⚡ **Optimized**: Efficient marker updates and memory management

## Installation

```bash
# In your workspace root
npm install
```

This package is part of the Barikoi workspace and is automatically linked.

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

## Development

```bash
# Build the package
cd packages/mqtt-location
npm run build

# Watch mode
npm run dev
```

## License

MIT

## Author

Barikoi
