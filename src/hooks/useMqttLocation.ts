import { useState, useEffect, useCallback, useRef } from 'react';
import type { MqttClient, IClientOptions } from 'mqtt';

// Dynamic import to handle mqtt's complex CJS/ESM exports
// @ts-ignore
import * as mqttModule from 'mqtt';
import type { 
  UseMqttLocationOptions, 
  UseMqttLocationReturn, 
  MqttMarker
} from '../types';
import { 
  buildMqttUri, 
  buildMqttTopic, 
  parseLocationMessage, 
  switchMqttSubscription,
  checkOfflineDevices 
} from '../utils';

const DEFAULT_OFFLINE_THRESHOLD = 10000; // 10 seconds
const DEFAULT_RECONNECT_PERIOD = 1000;
const DEFAULT_CONNECT_TIMEOUT = 4000;

/**
 * React hook for MQTT location tracking
 * 
 * @example
 * ```tsx
 * const { markers, isConnected, error } = useMqttLocation({
 *   config: {
 *     host: 'mqtt.example.com',
 *     port: 8083,
 *     username: 'user',
 *     password: 'pass',
 *   },
 *   topicConfig: {
 *     companyId: '123',
 *     groupId: '456',
 *   },
 *   offlineThresholdMs: 10000,
 * });
 * ```
 */
export const useMqttLocation = (options: UseMqttLocationOptions): UseMqttLocationReturn => {
  const {
    config,
    topic: initialTopic,
    topicConfig,
    offlineThresholdMs = DEFAULT_OFFLINE_THRESHOLD,
    autoConnect = true,
    onConnect,
    onDisconnect,
    onError,
    onMessage,
  } = options;

  const [markers, setMarkers] = useState<Record<string, MqttMarker>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentTopic, setCurrentTopic] = useState<string>('');

  const clientRef = useRef<MqttClient | null>(null);
  const offlineCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Build topic from config if provided
  const topicToSubscribe = initialTopic || (topicConfig ? buildMqttTopic(topicConfig) : '');

  /**
   * Check for offline devices periodically
   */
  const checkOffline = useCallback(() => {
    setMarkers((prevMarkers) => checkOfflineDevices(prevMarkers, offlineThresholdMs));
  }, [offlineThresholdMs]);

  /**
   * Connect to MQTT broker
   */
  const connect = useCallback(() => {
    if (clientRef.current?.connected) {
      console.log('MQTT client already connected');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const uri = buildMqttUri(
        config.host,
        config.port,
        config.protocol || 'ws'
      );

      const mqttOptions: IClientOptions = {
        username: config.username,
        password: config.password,
        clientId: `${config.clientIdPrefix || 'mqtt-client'}_${Math.random().toString(16).substring(2, 8)}`,
        clean: config.clean ?? true,
        connectTimeout: config.connectTimeout || DEFAULT_CONNECT_TIMEOUT,
        reconnectPeriod: config.reconnectPeriod || DEFAULT_RECONNECT_PERIOD,
        protocol: config.protocol || 'ws',
        rejectUnauthorized: false,
      };

      console.log('Connecting to MQTT broker:', uri);
      console.log('MQTT Options:', { ...mqttOptions, password: '***' });
      
      // Handle different mqtt module export patterns
      // @ts-ignore
      const mqtt = mqttModule.default?.default || mqttModule.default || mqttModule;
      console.log('MQTT module keys:', Object.keys(mqtt));
      console.log('MQTT connect type:', typeof mqtt.connect);
      
      if (typeof mqtt.connect !== 'function') {
        throw new Error('mqtt.connect is not a function. Available keys: ' + Object.keys(mqtt).join(', '));
      }
      
      const client = mqtt.connect(uri, mqttOptions);
      clientRef.current = client;

      // Set a connection timeout
      const connectionTimeout = setTimeout(() => {
        if (!client.connected) {
          console.error('MQTT Connection timeout - broker not responding');
          const timeoutError = new Error('Connection timeout: MQTT broker not responding');
          setError(timeoutError);
          setIsConnecting(false);
          onError?.(timeoutError);
        }
      }, (config.connectTimeout || DEFAULT_CONNECT_TIMEOUT) * 2);

      // Connection successful
      client.on('connect', (connack: unknown) => {
        clearTimeout(connectionTimeout);
        console.log('MQTT Connected successfully', connack);
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        onConnect?.();

        // Subscribe to topic if provided
        if (topicToSubscribe) {
          client.subscribe(topicToSubscribe, { qos: 0 }, (err: Error | null) => {
            if (err) {
              console.error('Subscription error:', err);
              setError(new Error(`Subscription failed: ${err.message}`));
            } else {
              console.log(`Subscribed to: ${topicToSubscribe}`);
              setCurrentTopic(topicToSubscribe);
            }
          });
        }
      });

      // Handle incoming messages
      client.on('message', (topic: string, message: Buffer) => {
        try {
          const marker = parseLocationMessage(message, topic);
          
          if (marker) {
            onMessage?.(topic, {
              device_id: marker.deviceId,
              latitude: marker.latitude,
              longitude: marker.longitude,
              speed: marker.speed,
              altitude: marker.altitude,
              accuracy: marker.accuracy,
            });

            setMarkers((prev) => ({
              ...prev,
              [marker.deviceId]: marker,
            }));
          }
        } catch (err) {
          console.error('Error handling MQTT message:', err);
        }
      });

      // Error handling
      client.on('error', (err: Error) => {
        console.error('MQTT connection error:', err);
        setError(err);
        setIsConnected(false);
      });

      // Connection closed
      client.on('close', () => {
        console.log('MQTT Connection closed');
        setIsConnected(false);
        onDisconnect?.();
      });

      // Reconnecting
      client.on('reconnect', () => {
        console.log('MQTT Reconnecting...');
        setIsConnecting(true);
      });

      // Client offline
      client.on('offline', () => {
        console.log('MQTT Client is offline');
        setIsConnected(false);
      });

      // Connection ended
      client.on('end', () => {
        console.log('MQTT Connection ended');
        setIsConnected(false);
      });

    } catch (err) {
      console.error('MQTT Setup error:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsConnecting(false);
      onError?.(err instanceof Error ? err : new Error(String(err)));
    }
  }, [config, topicToSubscribe, onConnect, onDisconnect, onError, onMessage]);

  /**
   * Disconnect from MQTT broker
   */
  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.end(true, () => {
        console.log('MQTT Connection terminated');
        clientRef.current = null;
        setIsConnected(false);
        setIsConnecting(false);
      });
    }
  }, []);

  /**
   * Subscribe to a topic
   */
  const subscribe = useCallback(async (topic: string): Promise<void> => {
    if (!clientRef.current?.connected) {
      throw new Error('MQTT client not connected');
    }

    return new Promise((resolve, reject) => {
      clientRef.current!.subscribe(topic, { qos: 0 }, (err) => {
        if (err) {
          console.error('Subscribe error:', err);
          reject(err);
        } else {
          console.log(`Subscribed to: ${topic}`);
          setCurrentTopic(topic);
          resolve();
        }
      });
    });
  }, []);

  /**
   * Unsubscribe from a topic
   */
  const unsubscribe = useCallback(async (topic: string): Promise<void> => {
    if (!clientRef.current?.connected) {
      throw new Error('MQTT client not connected');
    }

    return new Promise((resolve, reject) => {
      clientRef.current!.unsubscribe(topic, (err) => {
        if (err) {
          console.error('Unsubscribe error:', err);
          reject(err);
        } else {
          console.log(`Unsubscribed from: ${topic}`);
          if (currentTopic === topic) {
            setCurrentTopic('');
          }
          resolve();
        }
      });
    });
  }, [currentTopic]);

  /**
   * Switch to a new topic
   */
  const switchTopic = useCallback(async (newTopic: string): Promise<void> => {
    if (!clientRef.current?.connected) {
      throw new Error('MQTT client not connected');
    }

    await switchMqttSubscription(clientRef.current, currentTopic, newTopic);
    setCurrentTopic(newTopic);
  }, [currentTopic]);

  /**
   * Clear all markers
   */
  const clearMarkers = useCallback(() => {
    setMarkers({});
  }, []);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoConnect]); // Only run on mount/unmount

  // Set up offline check interval
  useEffect(() => {
    offlineCheckIntervalRef.current = setInterval(checkOffline, 30000); // Check every 30 seconds

    return () => {
      if (offlineCheckIntervalRef.current) {
        clearInterval(offlineCheckIntervalRef.current);
      }
    };
  }, [checkOffline]);

  return {
    markers,
    client: clientRef.current,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    switchTopic,
    clearMarkers,
  };
};
