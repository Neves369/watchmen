import { Platform } from 'react-native';

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

let connectedSocket: any = null;

export async function connectClassicDevice(address: string): Promise<boolean> {
  if (Platform.OS !== 'android') return false;

  try {
    const mod = await getClassicModule();
    if (!mod) return false;

    const device = await mod.connectToDevice?.(address);
    if (device) {
      connectedSocket = device;
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function disconnectClassicDevice(): Promise<void> {
  if (connectedSocket) {
    try {
      await connectedSocket.close?.();
    } catch {
      // silent
    }
    connectedSocket = null;
  }
}

export async function sendClassicData(data: string): Promise<boolean> {
  if (!connectedSocket) return false;

  try {
    await connectedSocket.write?.(data);
    return true;
  } catch {
    return false;
  }
}

export async function readClassicData(): Promise<string | null> {
  if (!connectedSocket) return null;

  try {
    const data = await connectedSocket.read?.();
    return data || null;
  } catch {
    return null;
  }
}

export function setClassicOnData(callback: (data: string) => void): void {
  if (connectedSocket) {
    try {
      connectedSocket.onDataReceived?.(callback);
    } catch {
      // silent
    }
  }
}

export function isClassicConnected(): boolean {
  return connectedSocket !== null;
}
