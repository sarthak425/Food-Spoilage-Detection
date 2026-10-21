import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { SensorReading, Alert, ActuatorStatus } from '../types';

interface WebSocketContextType {
  connected: boolean;
  latestReading: SensorReading | null;
  historyReadings: SensorReading[];
  latestAlert: Alert | null;
  actuatorStatus: ActuatorStatus | null;
}

const WebSocketContext = createContext<WebSocketContextType>({
  connected: false,
  latestReading: null,
  historyReadings: [],
  latestAlert: null,
  actuatorStatus: null,
});

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [latestReading, setLatestReading] = useState<SensorReading | null>(null);
  const [historyReadings, setHistoryReadings] = useState<SensorReading[]>([]);
  const [latestAlert, setLatestAlert] = useState<Alert | null>(null);
  const [actuatorStatus, setActuatorStatus] = useState<ActuatorStatus | null>(null);
  const stompClientRef = useRef<Client | null>(null);

  useEffect(() => {
    const socketFactory = () => new SockJS('/ws-sensor');

    const client = new Client({
      webSocketFactory: socketFactory,
      reconnectDelay: 3000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: () => {}, // silent in prod
      onConnect: () => {
        setConnected(true);

        // 1. Subscribe to latest global sensor telemetry
        client.subscribe('/topic/sensors/latest', (message: Message) => {
          try {
            const data: SensorReading = JSON.parse(message.body);
            setLatestReading(data);
            setHistoryReadings((prev) => {
              const updated = [...prev, data];
              return updated.length > 50 ? updated.slice(updated.length - 50) : updated;
            });
          } catch (e) {
            console.error('Failed to parse sensor message', e);
          }
        });

        // 2. Subscribe to real-time smart alerts
        client.subscribe('/topic/alerts', (message: Message) => {
          try {
            const alertData: Alert = JSON.parse(message.body);
            setLatestAlert(alertData);
          } catch (e) {
            console.error('Failed to parse alert message', e);
          }
        });

        // 3. Subscribe to virtual actuators
        client.subscribe('/topic/actuators', (message: Message) => {
          try {
            const actData: ActuatorStatus = JSON.parse(message.body);
            setActuatorStatus(actData);
          } catch (e) {
            console.error('Failed to parse actuator message', e);
          }
        });
      },
      onDisconnect: () => {
        setConnected(false);
      },
      onStompError: (frame) => {
        console.error('Broker error: ' + frame.headers['message']);
        setConnected(false);
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ connected, latestReading, historyReadings, latestAlert, actuatorStatus }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
