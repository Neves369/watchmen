import { create } from 'zustand';
import { produce } from 'immer';

export type DiscoveredDevice = {
  ip: string;
  mac: string | null;
  vendor: string | null;
  hostname: string | null;
  services: string[];
  openPorts: number[];
  discoveryMethod: 'arp' | 'mdns' | 'ping';
  firstSeen: string;
  lastSeen: string;
  isOnline: boolean;
};

export type DiscoveryConfig = {
  enableArp: boolean;
  enableMdns: boolean;
  enablePing: boolean;
  pingTimeout: number;
  serviceTypes: string[];
};

export type DiscoverySession = {
  id: string;
  timestamp: string;
  deviceCount: number;
  devices: DiscoveredDevice[];
};

type DiscoveryState = {
  devices: DiscoveredDevice[];
  sessions: DiscoverySession[];
  isLoading: boolean;
  scanProgress: { completed: number; total: number };
  error: string | null;
};

const initialState: DiscoveryState = {
  devices: [],
  sessions: [],
  isLoading: false,
  scanProgress: { completed: 0, total: 0 },
  error: null,
};

export const discoveryStore = create<DiscoveryState>(() => initialState);

export const defaultConfig: DiscoveryConfig = {
  enableArp: true,
  enableMdns: true,
  enablePing: true,
  pingTimeout: 2000,
  serviceTypes: ['http', 'https', 'ssh', 'ipp', 'printer', 'airplay', 'raop', 'smb', 'ftp'],
};

export function updateDiscoveryState(updater: (state: DiscoveryState) => void) {
  discoveryStore.setState(produce(discoveryStore.getState(), updater));
}

export function addDevices(newDevices: DiscoveredDevice[]) {
  updateDiscoveryState((state) => {
    for (const device of newDevices) {
      const existing = state.devices.find((d) => d.ip === device.ip);
      if (existing) {
        existing.lastSeen = device.lastSeen;
        existing.isOnline = true;
        if (device.hostname) existing.hostname = device.hostname;
        if (device.vendor) existing.vendor = device.vendor;
        if (device.mac) existing.mac = device.mac;
        existing.services = [...new Set([...existing.services, ...device.services])];
        existing.openPorts = [...new Set([...existing.openPorts, ...device.openPorts])];
      } else {
        state.devices.push(device);
      }
    }
  });
}

export function saveSession() {
  updateDiscoveryState((state) => {
    state.sessions.push({
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString(),
      deviceCount: state.devices.length,
      devices: [...state.devices],
    });
  });
}

export function clearDevices() {
  updateDiscoveryState((state) => {
    state.devices = [];
  });
}

export function clearSessions() {
  updateDiscoveryState((state) => {
    state.sessions = [];
  });
}

export function setLoading(loading: boolean) {
  updateDiscoveryState((state) => {
    state.isLoading = loading;
  });
}

export function setError(error: string | null) {
  updateDiscoveryState((state) => {
    state.error = error;
  });
}

export function setScanProgress(completed: number, total: number) {
  updateDiscoveryState((state) => {
    state.scanProgress = { completed, total };
  });
}
