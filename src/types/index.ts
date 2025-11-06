import type { MqttClient } from 'mqtt';

/**
 * MQTT Location Message - The payload structure for location updates
 */
export interface MqttLocationMessage {
  device_id?: string;
  user_id?: string;
  latitude: number | string;
  longitude: number | string;
  speed?: number | string;
  altitude?: number | string;
  accuracy?: number | string;
  timestamp?: number | string;
  [key: string]: unknown; // Allow additional custom fields
}

/**
 * MQTT Marker - Parsed and normalized location data
 */
export interface MqttMarker {
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
  [key: string]: unknown; // Allow additional custom fields
}

/**
 * Topic Configuration for building MQTT topics
 */
export interface TopicConfig {
  companyId: string;
  groupId?: string | null;
  userId?: string | null;
}

/**
 * MQTT Connection Configuration
 */
export interface MqttConnectionConfig {
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

/**
 * MQTT Hook Options
 */
export interface UseMqttLocationOptions {
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

/**
 * MQTT Hook Return Type
 */
export interface UseMqttLocationReturn {
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

/**
 * Message Parser Options
 */
export interface MessageParserOptions {
  deviceIdField?: string;
  userIdField?: string;
  latitudeField?: string;
  longitudeField?: string;
  speedField?: string;
}
