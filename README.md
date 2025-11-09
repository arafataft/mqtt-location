# @arafat75/mqtt-location

React hook and utility toolkit for MQTT-powered, real-time location tracking. Ship live maps faster with automatic reconnection, offline detection, topic management, and full TypeScript support.

[![npm version](https://img.shields.io/npm/v/@arafat75/mqtt-location)](https://www.npmjs.com/package/@arafat75/mqtt-location)
[![npm downloads](https://img.shields.io/npm/dm/@arafat75/mqtt-location)](https://www.npmjs.com/package/@arafat75/mqtt-location)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/license/mit)

## Highlights

- 🎣 Ready-to-use `useMqttLocation` hook with sensible defaults
- 🔄 Reconnect and keep-alive tuned for browser WebSocket brokers
- 📡 Offline device detection with periodic marker sweeps
- 🎯 Topic helpers for company, group, and user level filtering
- � Works in React 18/19 projects, ships TypeScript definitions out-of-the-box
- 🌍 Bundles WebSocket-friendly MQTT client and required browser polyfills

## Requirements

- MQTT broker with WebSocket (`ws://` or `wss://`) access
- React `^18 || ^19`
- TypeScript projects are supported but optional

## Installation

```bash
npm install @arafat75/mqtt-location
# or
yarn add @arafat75/mqtt-location
# or
pnpm add @arafat75/mqtt-location
```

## Quick Start

```tsx
import { useMqttLocation } from '@arafat75/mqtt-location';

const mqttConfig = {
  host: 'mqtt.example.com',
  port: 8083,
  username: 'demo',
  password: 'secret',
  protocol: 'ws', // defaults to ws
};

export function LiveDeviceList() {
  const { markers, isConnected, error } = useMqttLocation({
    config: mqttConfig,
    topicConfig: { companyId: 'company-123' },
    offlineThresholdMs: 10000,
  });

  if (error) return <p>Connection error: {error.message}</p>;
  if (!isConnected) return <p>Connecting to broker…</p>;

  return (
    <ul>
      {Object.values(markers).map((marker) => (
        <li key={marker.deviceId}>
          {marker.deviceId} → {marker.latitude.toFixed(5)}, {marker.longitude.toFixed(5)}
          {marker.isOnline ? ' (online)' : ' (offline)'}
        </li>
      ))}
    </ul>
  );
}
```

## Hook Reference

### `useMqttLocation(options)`

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `config` | `MqttConnectionConfig` | required | MQTT connection parameters (host, port, credentials, protocol).
| `topic` | `string` | `''` | Raw MQTT topic. Ignored when `topicConfig` is supplied.
| `topicConfig` | `TopicConfig` | `undefined` | Builder inputs for company/group/user topic patterns.
| `offlineThresholdMs` | `number` | `10000` | Mark device offline if no update received within this window.
| `autoConnect` | `boolean` | `true` | Automatically connect on mount.
| `onConnect` | `() => void` | `undefined` | Invoked after successful broker connection.
| `onDisconnect` | `() => void` | `undefined` | Invoked when the client disconnects or ends.
| `onError` | `(error: Error) => void` | `undefined` | Forward connection or subscription errors.
| `onMessage` | `(topic: string, message: MqttLocationMessage) => void` | `undefined` | Access raw payload alongside normalized markers.

The hook returns:

```ts
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

### Common Patterns

- **Filter by group**

  ```tsx
  useMqttLocation({
    config: mqttConfig,
    topicConfig: { companyId: 'company-123', groupId: 'group-456' },
  });
  ```

- **Track a specific user**

  ```tsx
  useMqttLocation({
    config: mqttConfig,
    topicConfig: { companyId: 'company-123', userId: 'user-789' },
  });
  ```

- **Custom topic string**

  ```tsx
  useMqttLocation({
    config: mqttConfig,
    topic: 'company/company-123/+/+/location',
  });
  ```

- **Switch topics at runtime**

  ```tsx
  const { switchTopic } = useMqttLocation({ config: mqttConfig, topicConfig: { companyId: 'company-123' } });

  async function handleGroupChange(groupId: string) {
    const newTopic = buildMqttTopic({ companyId: 'company-123', groupId });
    await switchTopic(newTopic);
  }
  ```

- **Tap into connection lifecycle**

  ```tsx
  useMqttLocation({
    config: mqttConfig,
    topicConfig: { companyId: 'company-123' },
    onConnect: () => console.info('MQTT connected'),
    onDisconnect: () => console.info('MQTT disconnected'),
    onError: (error) => console.error('MQTT error', error),
    onMessage: (topic, message) => console.debug('Raw payload', topic, message),
  });
  ```

## Utility Helpers

All utilities are exported from the package root.

- `buildMqttTopic(config: TopicConfig): string` – Assemble topics for company/group/user filters.
- `switchMqttSubscription(client, oldTopic, newTopic)` – Gracefully unsubscribe/subscribe when changing filters.
- `parseTopicGroupId(topic)`, `parseTopicCompanyId(topic)`, `parseTopicUserId(topic)` – Extract metadata from topic strings.
- `parseLocationMessage(message, topic, options?)` – Normalize MQTT payloads into `MqttMarker` objects. Supports custom field names via `MessageParserOptions`.
- `buildMqttUri(host, port, protocol?)` – Generate broker URLs for `ws`, `wss`, `mqtt`, or `mqtts`.
- `checkOfflineDevices(markers, thresholdMs)` – Mark stale devices offline based on timestamps.

## Data Types

```ts
interface TopicConfig {
  companyId: string;
  groupId?: string | null;
  userId?: string | null;
}

interface MqttConnectionConfig {
  host: string;
  port: number | string;
  username: string;
  password: string;
  protocol?: 'ws' | 'wss' | 'mqtt' | 'mqtts';
  clientIdPrefix?: string;
  reconnectPeriod?: number;
  connectTimeout?: number;
  clean?: boolean;
}

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
  [key: string]: unknown;
}

interface MessageParserOptions {
  deviceIdField?: string;
  userIdField?: string;
  latitudeField?: string;
  longitudeField?: string;
  speedField?: string;
}
```

## Topic Cheatsheet

```
company/{companyId}/{groupId}/{userId}/location
```

- Track every device in a company: `company/{companyId}/+/+/location`
- Track a group: `company/{companyId}/{groupId}/+/location`
- Track a single user: `company/{companyId}/+/{userId}/location`

## Troubleshooting

- **Handshake fails** – Confirm your broker exposes a WebSocket listener and that `protocol` matches (`ws` vs `wss`).
- **No markers appear** – Verify the topic matches the publisher, including company/group/user path segments.
- **Devices stuck online** – Adjust `offlineThresholdMs` to match your publisher’s heartbeat cadence.
- **TypeScript complaining about `Buffer`** – Make sure your project includes Node type stubs or upgrade to TypeScript `>=4.0` (recommended: project defaults to `~5.8`).

## Development

```bash
git clone https://github.com/arafataft/mqtt-location.git
cd mqtt-location/packages/mqtt-location
npm install
npm run dev # builds with watch
npm run build
```

Publish workflow:

```bash
npm version patch # or minor/major
npm run build
npm publish --access public
```

## Resources

- npm package: https://www.npmjs.com/package/@arafat75/mqtt-location
- Issue tracker: https://github.com/arafataft/mqtt-location/issues
- Releases & changelog: https://github.com/arafataft/mqtt-location/releases

## License

Released under the MIT License. See `LICENSE` for details.

## Maintainer

Md. Arafat Hossain · arafataft7@gmail.com · https://github.com/arafataft
