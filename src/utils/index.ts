import mqtt from 'mqtt';
import type { TopicConfig, MqttLocationMessage, MqttMarker, MessageParserOptions } from '../types';

/**
 * Build MQTT topic based on company, optional group, and optional user filter
 * 
 * Topic patterns:
 * - Single user: company/{companyId}/+/{userId}/location (matches user from any group)
 * - Group users: company/{companyId}/{groupId}/+/location (matches all users in group)
 * - All users: company/{companyId}/+/+/location (matches all users in company)
 */
export const buildMqttTopic = ({ companyId, groupId, userId }: TopicConfig): string => {
  if (userId) {
    // Show specific user from any group: company/{companyId}/+/{userId}/location
    return `company/${companyId}/+/${userId}/location`;
  }
  if (groupId) {
    // Show all users from specific group: company/{companyId}/{groupId}/+/location
    return `company/${companyId}/${groupId}/+/location`;
  }
  // Show all users from company: company/{companyId}/+/+/location
  return `company/${companyId}/+/+/location`;
};

/**
 * Switch MQTT subscription from old topic to new topic
 */
export const switchMqttSubscription = async (
  client: mqtt.MqttClient,
  oldTopic: string,
  newTopic: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    // If topics are the same, no need to switch
    if (oldTopic === newTopic) {
      resolve();
      return;
    }

    let unsubscribed = false;
    let subscribed = false;

    const checkComplete = () => {
      if ((unsubscribed || !oldTopic) && subscribed) {
        resolve();
      }
    };

    // Unsubscribe from old topic if it exists
    if (oldTopic) {
      client.unsubscribe(oldTopic, (err) => {
        if (err) {
          console.error('Unsubscribe error:', err);
        }
        unsubscribed = true;
        checkComplete();
      });
    } else {
      unsubscribed = true;
    }

    // Subscribe to new topic
    client.subscribe(newTopic, { qos: 0 }, (err) => {
      if (err) {
        console.error('Subscribe error:', err);
        reject(err);
      } else {
        subscribed = true;
        checkComplete();
      }
    });
  });
};

/**
 * Extract group ID from MQTT topic
 */
export const parseTopicGroupId = (topic: string): string | null => {
  const parts = topic.split('/');
  if (parts.length >= 3 && parts[2] !== '+') {
    return parts[2]; // Extract group_id from topic
  }
  return null;
};

/**
 * Extract company ID from MQTT topic
 */
export const parseTopicCompanyId = (topic: string): string | null => {
  const parts = topic.split('/');
  if (parts.length >= 2) {
    return parts[1]; // Extract company_id from topic
  }
  return null;
};

/**
 * Extract user ID from MQTT topic
 */
export const parseTopicUserId = (topic: string): string | null => {
  const parts = topic.split('/');
  if (parts.length >= 4 && parts[3] !== '+') {
    return parts[3]; // Extract user_id from topic
  }
  return null;
};

/**
 * Parse and normalize MQTT location message
 */
export const parseLocationMessage = (
  message: Buffer | string,
  topic: string,
  options?: MessageParserOptions
): MqttMarker | null => {
  try {
    const payload: MqttLocationMessage = typeof message === 'string' 
      ? JSON.parse(message) 
      : JSON.parse(message.toString());

    const deviceIdField = options?.deviceIdField || 'device_id';
    const userIdField = options?.userIdField || 'user_id';
    const latField = options?.latitudeField || 'latitude';
    const lngField = options?.longitudeField || 'longitude';
    const speedField = options?.speedField || 'speed';

    // Validate required fields
    if (!payload[latField] || !payload[lngField]) {
      console.warn('Missing required location fields:', payload);
      return null;
    }

    const deviceId = (payload[deviceIdField] || payload[userIdField] || 'unknown-device') as string;
    const groupId = parseTopicGroupId(topic);
    const companyId = parseTopicCompanyId(topic);

    return {
      deviceId,
      latitude: parseFloat(payload[latField] as string),
      longitude: parseFloat(payload[lngField] as string),
      speed: payload[speedField] ? parseFloat(payload[speedField] as string) : undefined,
      altitude: payload.altitude ? parseFloat(payload.altitude as string) : undefined,
      accuracy: payload.accuracy ? parseFloat(payload.accuracy as string) : undefined,
      timestamp: Date.now(),
      isOnline: true,
      groupId: groupId || undefined,
      companyId: companyId || undefined,
    };
  } catch (error) {
    console.error('Error parsing MQTT message:', error, message.toString());
    return null;
  }
};

/**
 * Build MQTT connection URI
 */
export const buildMqttUri = (host: string, port: number | string, protocol: 'ws' | 'wss' | 'mqtt' | 'mqtts' = 'ws'): string => {
  const wsPort = protocol === 'ws' || protocol === 'wss' ? 8083 : port;
  
  if (protocol === 'ws' || protocol === 'wss') {
    return `${protocol}://${host}:${wsPort}/mqtt`;
  }
  
  return `${protocol}://${host}:${port}`;
};

/**
 * Check if devices in markers are offline based on threshold
 */
export const checkOfflineDevices = (
  markers: Record<string, MqttMarker>,
  offlineThresholdMs: number
): Record<string, MqttMarker> => {
  const now = Date.now();
  const updatedMarkers = { ...markers };
  let hasUpdates = false;

  Object.entries(updatedMarkers).forEach(([deviceId, marker]) => {
    const timeSinceLastUpdate = now - marker.timestamp;
    const shouldBeOnline = timeSinceLastUpdate < offlineThresholdMs;

    if (marker.isOnline !== shouldBeOnline) {
      updatedMarkers[deviceId] = {
        ...marker,
        isOnline: shouldBeOnline,
      };
      hasUpdates = true;
    }
  });

  return hasUpdates ? updatedMarkers : markers;
};
