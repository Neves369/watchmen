import {
  Scanner,
  requestLocalNetworkPermission,
  BonjourScanner,
} from '@dawidzawada/bonjour-zeroconf';

export type MdnsService = {
  name: string;
  type: string;
  ipv4: string | null;
  ipv6: string | null;
  hostname: string | null;
  port: number | null;
};

const typedScanner: BonjourScanner = Scanner;

export async function startMdnsScan(
  serviceTypes: string[],
  domain = 'local.',
  onFound?: (service: MdnsService) => void,
  onProgress?: (completed: number, total: number) => void
): Promise<MdnsService[]> {
  const granted = await requestLocalNetworkPermission();
  if (!granted) {
    return [];
  }

  const foundServices: MdnsService[] = [];
  const scanTimeout = 4000;

  for (let i = 0; i < serviceTypes.length; i++) {
    const type = serviceTypes[i];
    try {
      const results = await Promise.race([
        typedScanner.scanFor(3000, type, domain),
        new Promise<never[]>((resolve) => setTimeout(() => resolve([]), scanTimeout)),
      ]);

      onProgress?.(i + 1, serviceTypes.length);

      for (const result of results) {
        const entry: MdnsService = {
          name: result.name,
          type,
          ipv4: result.ipv4 || null,
          ipv6: result.ipv6 || null,
          hostname: result.hostname || null,
          port: result.port || null,
        };

        const exists = foundServices.some(
          (s) => s.name === entry.name && s.type === entry.type && s.ipv4 === entry.ipv4
        );

        if (!exists) {
          foundServices.push(entry);
          onFound?.(entry);
        }
      }
    } catch {
      onProgress?.(i + 1, serviceTypes.length);
      continue;
    }
  }

  return foundServices;
}

export function getCommonServiceTypes(): string[] {
  return [
    'http',
    'https',
    'ssh',
    'ipp',
    'printer',
    'airplay',
    'raop',
    'smb',
    'afpovertcp',
    'ftp',
    'rdp',
    'sftp',
    'sip',
  ];
}

export function getServiceIcon(type: string): string {
  const icons: Record<string, string> = {
    http: 'globe',
    https: 'lock',
    ssh: 'terminal',
    ipp: 'printer',
    printer: 'printer',
    airplay: 'cast',
    raop: 'music',
    smb: 'folder',
    afpovertcp: 'folder',
    ftp: 'upload',
    rdp: 'monitor',
    sftp: 'lock',
    sip: 'phone',
  };
  return icons[type] || 'help-circle';
}

export default {
  startMdnsScan,
  getCommonServiceTypes,
  getServiceIcon,
};
