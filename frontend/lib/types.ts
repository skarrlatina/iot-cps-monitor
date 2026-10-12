export type TemperatureSensor = {
  id: string;
  sensorName: string;
  value: number;
  unit: string;
  timestamp: string;
  createdAt: string;
};

export type CriticalAlert = {
  type: string;
  message: string;
  sensorId: string;
  sensorName: string;
  value: number;
  unit: string;
  timestamp?: string;
  createdAt?: string;
};
