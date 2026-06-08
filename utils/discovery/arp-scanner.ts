import TcpSocket from 'react-native-tcp-socket';
import sip from '../shift8-ip-func';
import NetInfo from '@react-native-community/netinfo';
import ipaddr from 'ipaddr.js';

export type ArpEntry = {
  ip: string;
  mac: string;
  device?: string;
};

const ARP_FILE = '/proc/net/arp';

function parseArpTable(raw: string): ArpEntry[] {
  const lines = raw.trim().split('\n');
  const entries: ArpEntry[] = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].trim().split(/\s+/);
    if (parts.length >= 4) {
      const ip = parts[0];
      const flags = parts[2];
      const mac = parts[3];

      if (flags === '0x2' && mac && mac !== '00:00:00:00:00:00') {
        entries.push({
          ip,
          mac: mac.toUpperCase(),
          device: parts[4] || undefined,
        });
      }
    }
  }

  return entries;
}

async function readArpTable(): Promise<ArpEntry[]> {
  try {
    const response = await fetch('file://' + ARP_FILE);
    const text = await response.text();
    return parseArpTable(text);
  } catch {
    return [];
  }
}

function pingHost(hostIP: string, timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    let resolved = false;
    const resolveOnce = (value: boolean) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeout);
      try {
        client.destroy();
      } catch {}
      resolve(value);
    };
    const client = TcpSocket.connect({ port: 9, host: hostIP }, function () {
      resolveOnce(true);
    });

    client.on('error', function (err: any) {
      resolveOnce(false);
    });

    const timeout = setTimeout(() => {
      resolveOnce(false);
    }, timeoutMs);

    client.on('close', function () {
      clearTimeout(timeout);
    });
  });
}

async function pingSweep(
  ipRange: string[],
  timeoutMs: number,
  onProgress?: (completed: number, total: number) => void
): Promise<string[]> {
  const alive: string[] = [];
  let completed = 0;
  const total = ipRange.length;
  const maxConcurrency = Math.min(20, total);
  let currentIndex = 0;

  const ping = (ip: string) =>
    Promise.race([
      pingHost(ip, timeoutMs),
      new Promise<boolean>((resolve) => setTimeout(() => resolve(false), timeoutMs + 1000)),
    ]);

  const worker = async () => {
    while (true) {
      const index = currentIndex;
      currentIndex += 1;
      if (index >= total) break;
      const ip = ipRange[index];
      try {
        const isAlive = await ping(ip);
        completed++;
        onProgress?.(completed, total);
        if (isAlive) {
          alive.push(ip);
        }
      } catch {
        completed++;
        onProgress?.(completed, total);
      }
    }
  };

  await Promise.all(Array.from({ length: maxConcurrency }, () => worker()));
  return alive;
}

export async function getNetworkRange(): Promise<{
  ipRange: string[];
  localIp: string;
  subnet: string;
}> {
  const state: any = await NetInfo.fetch();
  const localIp = state.details?.ipAddress;
  const subnet = state.details?.subnet;

  if (!localIp || !subnet) {
    throw new Error('Não foi possível obter informações de rede');
  }

  const prefixLen = ipaddr.IPv4.parse(subnet).prefixLengthFromSubnetMask();
  const firstHost = ipaddr.IPv4.networkAddressFromCIDR(localIp + '/' + prefixLen);
  const lastHost = ipaddr.IPv4.broadcastAddressFromCIDR(localIp + '/' + prefixLen);
  const firstHostHex = sip.convertIPtoHex(firstHost);
  const lastHostHex = sip.convertIPtoHex(lastHost);
  const ipRange = sip.getIPRange(firstHostHex, lastHostHex);

  return { ipRange, localIp, subnet };
}

export async function arpScan(
  timeoutMs = 2000,
  onProgress?: (completed: number, total: number) => void
): Promise<ArpEntry[]> {
  const { ipRange } = await getNetworkRange();

  const aliveIps = await pingSweep(ipRange, timeoutMs, onProgress);

  const entries = await readArpTable();
  if (entries.length > 0) {
    return entries;
  }

  return aliveIps.map((ip) => ({ ip, mac: '' }));
}

export default {
  arpScan,
  getNetworkRange,
  pingSweep,
  readArpTable,
  parseArpTable,
};
