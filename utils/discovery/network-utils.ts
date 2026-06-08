export async function resolveHostname(ip: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const response = await fetch('http://' + ip + '/', {
      method: 'HEAD',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return response.headers.get('server') || null;
  } catch {
    return null;
  }
}

export function isValidIp(ip: string): boolean {
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  return parts.every((p) => {
    const n = parseInt(p, 10);
    return !isNaN(n) && n >= 0 && n <= 255;
  });
}

export function ipToNumber(ip: string): number {
  const parts = ip.split('.').map((p) => parseInt(p, 10));
  return (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3];
}

export function numberToIp(n: number): string {
  return [(n >> 24) & 0xff, (n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff].join('.');
}

export function isLocalIp(ip: string, localIp: string): boolean {
  return ip === localIp;
}

export function isGateway(ip: string, subnet: string): boolean {
  const parts = ip.split('.').map((p) => parseInt(p, 10));
  const mask = subnet.split('.').map((p) => parseInt(p, 10));
  const network = parts.map((p, i) => p & mask[i]);
  return network.join('.') === parts.slice(0, 3).join('.') + '.1';
}

export default {
  resolveHostname,
  isValidIp,
  ipToNumber,
  numberToIp,
  isLocalIp,
  isGateway,
};
