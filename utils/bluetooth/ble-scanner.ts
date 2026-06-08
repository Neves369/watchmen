import { Platform, PermissionsAndroid } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import { BluetoothDevice } from './types';

const manager = new BleManager();

export async function requestBlePermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;

  try {
    const apiLevel = Platform.Version;
    if (typeof apiLevel === 'number' && apiLevel >= 31) {
      const granted = await PermissionsAndroid.requestMultiple([
        'android.permission.BLUETOOTH_SCAN',
        'android.permission.BLUETOOTH_CONNECT',
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      return Object.values(granted).every((v) => v === 'granted');
    } else {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted === 'granted';
    }
  } catch {
    return false;
  }
}

export async function startBleScan(
  durationMs: number,
  onDevice: (device: BluetoothDevice) => void,
  onFinish: () => void
): Promise<void> {
  const seen = new Set<string>();

  manager.startDeviceScan(null, { allowDuplicates: false, scanMode: 2 }, (error, device) => {
    if (error) return;

    if (device && !seen.has(device.id)) {
      seen.add(device.id);
      const btDevice: BluetoothDevice = {
        id: device.id,
        name: device.name || null,
        mac: device.id,
        rssi: device.rssi || null,
        transport: 'ble',
        isConnected: false,
        serviceUuids: device.serviceUUIDs || undefined,
      };
      onDevice(btDevice);
    }
  });

  setTimeout(() => {
    manager.stopDeviceScan();
    onFinish();
  }, durationMs);
}

export function stopBleScan(): void {
  manager.stopDeviceScan();
}

export function getBleManager(): BleManager {
  return manager;
}
