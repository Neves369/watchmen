import { create } from 'zustand';
import { produce } from 'immer';
import { BluetoothDevice, BluetoothConfig, defaultBluetoothConfig } from '~/utils/bluetooth/types';

type BluetoothState = {
  devices: BluetoothDevice[];
  bondedDevices: BluetoothDevice[];
  connectedDevice: BluetoothDevice | null;
  isLoading: boolean;
  isScanning: boolean;
  error: string | null;
};

const initialState: BluetoothState = {
  devices: [],
  bondedDevices: [],
  connectedDevice: null,
  isLoading: false,
  isScanning: false,
  error: null,
};

export const bluetoothStore = create<BluetoothState>(() => initialState);

export const defaultConfig: BluetoothConfig = defaultBluetoothConfig;

export function updateBluetoothState(updater: (state: BluetoothState) => void) {
  bluetoothStore.setState(produce(bluetoothStore.getState(), updater));
}

export function setLoading(loading: boolean) {
  updateBluetoothState((state) => {
    state.isLoading = loading;
  });
}

export function setScanning(scanning: boolean) {
  updateBluetoothState((state) => {
    state.isScanning = scanning;
  });
}

export function setError(error: string | null) {
  updateBluetoothState((state) => {
    state.error = error;
  });
}

export function addDevice(device: BluetoothDevice) {
  updateBluetoothState((state) => {
    const existing = state.devices.find((d) => d.id === device.id);
    if (existing) {
      existing.rssi = device.rssi;
      existing.name = device.name || existing.name;
      existing.services = device.services || existing.services;
      existing.serviceUuids = device.serviceUuids || existing.serviceUuids;
    } else {
      state.devices.push(device);
    }
  });
}

export function clearDevices() {
  updateBluetoothState((state) => {
    state.devices = [];
  });
}

export function setBondedDevices(devices: BluetoothDevice[]) {
  updateBluetoothState((state) => {
    state.bondedDevices = devices;
  });
}

export function setConnectedDevice(device: BluetoothDevice | null) {
  updateBluetoothState((state) => {
    if (device) {
      state.connectedDevice = device;
      const existing = state.devices.find((d) => d.id === device.id);
      if (existing) {
        existing.isConnected = true;
      }
    } else {
      if (state.connectedDevice) {
        const prev = state.devices.find((d) => d.id === state.connectedDevice!.id);
        if (prev) prev.isConnected = false;
      }
      state.connectedDevice = null;
    }
  });
}

export function updateDeviceServices(deviceId: string, services: any[]) {
  updateBluetoothState((state) => {
    const device = state.devices.find((d) => d.id === deviceId);
    if (device) {
      device.services = services;
    }
  });
}
