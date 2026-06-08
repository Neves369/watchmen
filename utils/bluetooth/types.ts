export type BluetoothTransport = 'ble' | 'classic';

export type BleService = {
  uuid: string;
  characteristics: BleCharacteristic[];
};

export type BleCharacteristic = {
  uuid: string;
  serviceUuid: string;
  properties: string[];
  value: string | null;
};

export type BluetoothDevice = {
  id: string;
  name: string | null;
  mac: string;
  rssi: number | null;
  transport: BluetoothTransport;
  isConnected: boolean;
  services?: BleService[];
  serviceUuids?: string[];
};

export type BluetoothConfig = {
  enableBle: boolean;
  enableClassic: boolean;
  scanDuration: number;
  minRssi: number;
};

export const defaultBluetoothConfig: BluetoothConfig = {
  enableBle: true,
  enableClassic: true,
  scanDuration: 5000,
  minRssi: -100,
};
