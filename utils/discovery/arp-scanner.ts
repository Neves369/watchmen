import TcpSocket from 'react-native-tcp-socket';
import NetInfo from '@react-native-community/netinfo';
import { NativeModules } from 'react-native';
import { ipToNumber, numberToIp } from './network-utils';

export type ArpEntry = {
  ip: string;
  mac: string;
};

const COMMON_PORTS = [80, 443, 22, 445, 139, 548, 5000, 631, 8080, 9, 3000, 8443, 5900, 5353];

function isReachable(err: any): boolean {
  const code = err?.code;
  return code === 'ECONNREFUSED' || code === 'ECONNRESET';
}

function tryPorts(hostIP: string, timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    let resolved = false;
    const resolveOnce = (value: boolean) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(fallbackTimeout);
      resolve(value);
    };

    let pending = COMMON_PORTS.length;
    const sockets: TcpSocket.Socket[] = [];

    for (const port of COMMON_PORTS) {
      const client = TcpSocket.connect({ port, host: hostIP }, () => {
        resolveOnce(true);
        sockets.forEach((s) => {
          try { s.destroy(); } catch {}
        });
      });

      sockets.push(client);
      client.on('error', (err: any) => {
        pending--;
        if (isReachable(err) || pending === 0) resolveOnce(isReachable(err));
      });
    }

    const fallbackTimeout = setTimeout(() => {
      resolveOnce(false);
      sockets.forEach((s) => {
        try { s.destroy(); } catch {}
      });
    }, timeoutMs);
  });
}

function probeHost(hostIP: string, timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    const client = TcpSocket.connect({ port: 65535, host: hostIP }, () => {
      try { client.destroy(); } catch {}
      resolve(true);
    });

    client.on('error', (err: any) => {
      try { client.destroy(); } catch {}
      resolve(isReachable(err));
    });

    setTimeout(() => {
      try { client.destroy(); } catch {}
      resolve(false);
    }, timeoutMs);
  });
}

async function concurrentScan(
  ipRange: string[],
  timeoutMs: number,
  scanFn: (ip: string, timeoutMs: number) => Promise<boolean>,
  concurrency: number,
  onProgress?: (completed: number, total: number) => void
): Promise<string[]> {
  const alive: string[] = [];
  let completed = 0;
  const total = ipRange.length;
  const maxConcurrency = Math.min(concurrency, total);
  let currentIndex = 0;

  const worker = async () => {
    while (true) {
      const index = currentIndex;
      currentIndex += 1;
      if (index >= total) break;
      const ip = ipRange[index];
      try {
        const result = await scanFn(ip, timeoutMs);
        completed++;
        onProgress?.(completed, total);
        if (result) alive.push(ip);
      } catch {
        completed++;
        onProgress?.(completed, total);
      }
    }
  };

  await Promise.all(Array.from({ length: maxConcurrency }, () => worker()));
  return alive;
}

async function getNetworkRange(): Promise<{
  ipRange: string[];
  localIp: string;
  subnet: string;
}> {
  const state: any = await NetInfo.fetch();
  const localIp = state.details?.ipAddress as string | undefined;
  const rawSubnet = state.details?.subnet as string | undefined;

  if (!localIp || !rawSubnet) {
    throw new Error('Não foi possível obter informações de rede');
  }

  const maskNum = ipToNumber(rawSubnet);
  const localNum = ipToNumber(localIp);
  const networkNum = localNum & maskNum;
  const broadcastNum = networkNum | (~maskNum >>> 0);

  const ipRange: string[] = [];
  for (let i = networkNum + 1; i < broadcastNum; i++) {
    ipRange.push(numberToIp(i));
  }

  return { ipRange, localIp, subnet: rawSubnet };
}

async function icmpPingSweep(
  ipRange: string[],
  timeoutMs: number,
  concurrency: number,
  onProgress?: (completed: number, total: number) => void
): Promise<string[]> {
  const alive: string[] = [];
  let completed = 0;
  const total = ipRange.length;
  const maxConcurrency = Math.min(concurrency, total);
  let currentIndex = 0;

  const worker = async () => {
    while (true) {
      const index = currentIndex;
      currentIndex += 1;
      if (index >= total) break;
      const ip = ipRange[index];
      try {
        const result = await NativeModules.WatchmenNetwork.ping(ip, timeoutMs);
        completed++;
        onProgress?.(completed, total);
        if (result) alive.push(ip);
      } catch {
        completed++;
        onProgress?.(completed, total);
      }
    }
  };

  await Promise.all(Array.from({ length: maxConcurrency }, () => worker()));
  return alive;
}

async function readNativeArpTable(): Promise<ArpEntry[]> {
  try {
    const entries: any[] = await NativeModules.WatchmenNetwork.readArpTable();
    return entries.map((e: any) => ({ ip: e.ip, mac: e.mac }));
  } catch {
    return [];
  }
}

async function readNativeIpNeigh(): Promise<ArpEntry[]> {
  try {
    const entries: any[] = await NativeModules.WatchmenNetwork.readIpNeigh();
    return entries.map((e: any) => ({ ip: e.ip, mac: e.mac }));
  } catch {
    return [];
  }
}

export async function arpScan(
  timeoutMs = 3000,
  enablePing = true,
  onProgress?: (completed: number, total: number, phase: string) => void
): Promise<ArpEntry[]> {
  const { ipRange, localIp } = await getNetworkRange();

  const halfTimeout = Math.max(500, Math.floor(timeoutMs / 2));

  const wrapProgress = (phase: string) => (completed: number, total: number) => {
    onProgress?.(completed, total, phase);
  };

  const [connectedIps, probedIps] = await Promise.all([
    concurrentScan(ipRange, halfTimeout, tryPorts, 20, wrapProgress('tcp')),
    concurrentScan(
      ipRange.filter((ip) => ip !== localIp),
      halfTimeout,
      probeHost,
      50,
      wrapProgress('probe')
    ),
  ]);

  const pingAlive = enablePing
    ? await icmpPingSweep(ipRange, halfTimeout, 30, wrapProgress('ping'))
    : [];

  const arpEntries = await readNativeArpTable();
  const neighEntries = await readNativeIpNeigh();

  const macMap = new Map<string, string>();
  for (const entry of arpEntries) {
    macMap.set(entry.ip, entry.mac);
  }
  for (const entry of neighEntries) {
    if (!macMap.has(entry.ip)) {
      macMap.set(entry.ip, entry.mac);
    }
  }

  const mergedIps = new Set<string>([
    ...macMap.keys(),
    ...connectedIps,
    ...probedIps,
    ...pingAlive,
  ]);

  return Array.from(mergedIps).map((ip) => ({
    ip,
    mac: macMap.get(ip) || '',
  }));
}

export default { arpScan, getNetworkRange };
