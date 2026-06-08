import { BleManager, Characteristic } from 'react-native-ble-plx';
import { BleService, BleCharacteristic } from './types';

const manager = new BleManager();

export async function connectToBleDevice(deviceId: string): Promise<boolean> {
  try {
    const device = await manager.connectToDevice(deviceId);
    await device.discoverAllServicesAndCharacteristics();
    return true;
  } catch {
    return false;
  }
}

export async function disconnectBleDevice(deviceId: string): Promise<void> {
  try {
    const device = await manager.connectToDevice(deviceId);
    await device.cancelConnection();
  } catch {
    // silent
  }
}

export async function getBleServices(deviceId: string): Promise<BleService[]> {
  const device = await manager.connectToDevice(deviceId);
  await device.discoverAllServicesAndCharacteristics();

  const nativeServices = await device.services();
  const services: BleService[] = [];

  for (const svc of nativeServices) {
    const nativeChars = await svc.characteristics();
    const characteristics: BleCharacteristic[] = nativeChars.map((c) => ({
      uuid: c.uuid,
      serviceUuid: svc.uuid,
      properties: parseProperties(c),
      value: c.value || null,
    }));

    services.push({
      uuid: svc.uuid,
      characteristics,
    });
  }

  return services;
}

function parseProperties(char: Characteristic): string[] {
  const props: string[] = [];
  if (char.isReadable) props.push('read');
  if (char.isWritableWithResponse) props.push('write');
  if (char.isWritableWithoutResponse) props.push('writeWithoutResponse');
  if (char.isNotifiable || char.isIndicatable) props.push('notify');
  return props;
}

export async function readCharacteristic(
  deviceId: string,
  serviceUuid: string,
  charUuid: string
): Promise<string | null> {
  try {
    const device = await manager.connectToDevice(deviceId);
    const char = await device.readCharacteristicForService(serviceUuid, charUuid);
    return char.value || null;
  } catch {
    return null;
  }
}

export async function writeCharacteristic(
  deviceId: string,
  serviceUuid: string,
  charUuid: string,
  base64Value: string,
  withResponse: boolean = true
): Promise<boolean> {
  try {
    const device = await manager.connectToDevice(deviceId);
    if (withResponse) {
      await device.writeCharacteristicWithResponseForService(serviceUuid, charUuid, base64Value);
    } else {
      await device.writeCharacteristicWithoutResponseForService(serviceUuid, charUuid, base64Value);
    }
    return true;
  } catch {
    return false;
  }
}

export async function monitorCharacteristic(
  deviceId: string,
  serviceUuid: string,
  charUuid: string,
  onValue: (value: string) => void
): Promise<() => void> {
  const device = await manager.connectToDevice(deviceId);

  const subscription = device.monitorCharacteristicForService(
    serviceUuid,
    charUuid,
    (error, characteristic) => {
      if (error) return;
      if (characteristic?.value) {
        onValue(characteristic.value);
      }
    }
  );

  return () => {
    subscription?.remove();
  };
}

export async function isBleDeviceConnected(deviceId: string): Promise<boolean> {
  try {
    const device = await manager.connectToDevice(deviceId);
    return device.isConnected();
  } catch {
    return false;
  }
}
