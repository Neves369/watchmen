import { Platform, PermissionsAndroid } from 'react-native';
import { BluetoothDevice, BluetoothTransport } from './types';

let classicModule: any = null;

async function getClassicModule(): Promise<any> {
  if (classicModule) return classicModule;
  try {
    const mod = await import('react-native-bluetooth-classic');
    classicModule = mod;
    return classicModule;
  } catch {
    return null;
  }
}

export async function requestClassicPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;

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

export async function startClassicScan(
  durationMs: number,
  onDevice: (device: BluetoothDevice) => void,
  onFinish: () => void
): Promise<void> {
  if (Platform.OS !== 'android') {
    setTimeout(onFinish, 100);
    return;
  }

  const mod = await getClassicModule();
  if (!mod) {
    setTimeout(onFinish, 100);
    return;
  }

  const discovered = new Set<string>();

  try {
    const devices = await mod.startDiscovery?.(durationMs);
    if (Array.isArray(devices)) {
      for (const d of devices) {
        if (!discovered.has(d.address)) {
          discovered.add(d.address);
          const btDevice: BluetoothDevice = {
            id: d.address,
            name: d.name || null,
            mac: d.address,
            rssi: null,
            transport: 'classic' as BluetoothTransport,
            isConnected: false,
          };
          onDevice(btDevice);
        }
      }
    }
  } catch {
    // silent
  }

  onFinish();
}

export async function stopClassicScan(): Promise<void> {
  if (Platform.OS !== 'android') return;
  const mod = await getClassicModule();
  if (mod) {
    try {
      await mod.cancelDiscovery?.();
    } catch {
      // silent
    }
  }
}

export async function getBondedClassicDevices(): Promise<BluetoothDevice[]> {
  if (Platform.OS !== 'android') return [];

  const mod = await getClassicModule();
  if (!mod) return [];

  try {
    const bonded = await mod.getBondedDevices?.();
    if (!Array.isArray(bonded)) return [];

    return bonded.map((d: any) => ({
      id: d.address,
      name: d.name || null,
      mac: d.address,
      rssi: null,
      transport: 'classic' as BluetoothTransport,
      isConnected: false,
    }));
  } catch {
    return [];
  }
}
