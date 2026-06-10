import { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import { Button } from '~/components/Button';
import { Container } from '~/components/Container';
import macVendors from '~/utils/discovery/mac-vendors.json';
import { arpScan } from '~/utils/discovery/arp-scanner';
import { startMdnsScan, getCommonServiceTypes } from '~/utils/discovery/mdns-scanner';
import {
  discoveryStore,
  addDevices,
  setLoading,
  setScanProgress,
  setError,
  clearDevices,
  saveSession,
  type DiscoveredDevice,
  defaultConfig,
} from '~/store/discovery-store';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';

function lookupVendor(mac: string | null | undefined): string | null {
  if (!mac) return null;
  const prefix = mac.replace(/:/g, '').substring(0, 6).toUpperCase();
  return (macVendors as Record<string, string>)[prefix] || null;
}

function phaseLabel(phase: string): string {
  const labels: Record<string, string> = {
    tcp: 'TCP ports',
    probe: 'Probing hosts',
    ping: 'ICMP ping',
    mdns: 'mDNS services',
  };
  return labels[phase] || phase;
}

export default function DiscoveryPrincipal() {
  const router = useRouter();
  const devices = discoveryStore((s) => s.devices);
  const isLoading = discoveryStore((s) => s.isLoading);
  const scanProgress = discoveryStore((s) => s.scanProgress);
  const error = discoveryStore((s) => s.error);
  const [config] = useState(defaultConfig);
  const [scanPhase, setScanPhase] = useState<string>('idle');
  const [mdnsProgress, setMdnsProgress] = useState({ completed: 0, total: 0 });
  const [hasScanned, setHasScanned] = useState(false);

  const iniciar = async () => {
    clearDevices();
    setLoading(true);
    setError(null);
    setScanProgress(0, 0);
    setHasScanned(false);
    setScanPhase('tcp');

    try {
      const allDevices: Map<string, DiscoveredDevice> = new Map();

      if (config.enableArp) {
        setScanProgress(0, 0);
        ToastAndroid.show('Escaneando rede...', ToastAndroid.SHORT);

        const arpEntries = await arpScan(
          config.pingTimeout,
          config.enablePing,
          (completed, total, phase) => {
            setScanPhase(phase);
            setScanProgress(completed, total);
          }
        );

        for (const entry of arpEntries) {
          const mac = entry.mac || null;
          const existing = allDevices.get(entry.ip);
          if (existing) {
            if (mac) {
              existing.mac = mac;
              existing.vendor = lookupVendor(mac);
            }
          } else {
            allDevices.set(entry.ip, {
              ip: entry.ip,
              mac,
              vendor: lookupVendor(mac),
              hostname: null,
              services: [],
              openPorts: [],
              discoveryMethod: 'arp',
              firstSeen: new Date().toLocaleString(),
              lastSeen: new Date().toLocaleString(),
              isOnline: true,
            });
          }
        }
      }

      if (config.enableMdns) {
        setScanPhase('mdns');
        const serviceTypes =
          config.serviceTypes.length > 0 ? config.serviceTypes : getCommonServiceTypes();
        setMdnsProgress({ completed: 0, total: serviceTypes.length });
        ToastAndroid.show('Buscando dispositivos mDNS...', ToastAndroid.SHORT);

        await startMdnsScan(
          serviceTypes,
          'local.',
          (service) => {
            const addr = service.ipv4;
            if (!addr) return;
            const existing = allDevices.get(addr);
            if (existing) {
              existing.hostname = existing.hostname || service.hostname || service.name;
              if (!existing.services.includes(service.type)) {
                existing.services.push(service.type);
              }
              if (service.port && !existing.openPorts.includes(service.port)) {
                existing.openPorts.push(service.port);
              }
            } else {
              allDevices.set(addr, {
                ip: addr,
                mac: null,
                vendor: null,
                hostname: service.hostname || service.name,
                services: [service.type],
                openPorts: service.port ? [service.port] : [],
                discoveryMethod: 'mdns',
                firstSeen: new Date().toLocaleString(),
                lastSeen: new Date().toLocaleString(),
                isOnline: true,
              });
            }
          },
          (completed, total) => setMdnsProgress({ completed, total })
        );
      }

      const deviceList = Array.from(allDevices.values()).sort((a, b) =>
        a.ip.localeCompare(b.ip, undefined, { numeric: true })
      );

      addDevices(deviceList);
      saveSession();
      setHasScanned(true);

      ToastAndroid.show(`${deviceList.length} dispositivo(s) encontrado(s)`, ToastAndroid.LONG);
    } catch (err: any) {
      setError(err.message);
      ToastAndroid.show(`Erro: ${err.message}`, ToastAndroid.LONG);
    } finally {
      setLoading(false);
      setScanPhase('idle');
    }
  };

  const renderItem = useCallback(
    ({ item }: { item: DiscoveredDevice }) => (
      <TouchableOpacity
        onPress={() =>
          router.push({ pathname: '/discovery/detalhes', params: { data: JSON.stringify(item) } })
        }
        className="my-1.5 w-full self-center rounded-lg bg-[#2A2A2A] p-4 shadow-md shadow-black">
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-white">{item.ip}</Text>
          <View className="flex-row items-center">
            <View
              className={`mr-1.5 h-2 w-2 rounded-full ${item.isOnline ? 'bg-[#00C851]' : 'bg-[#FF4444]'}`}
            />
            <Text
              className={`text-sm font-medium ${item.isOnline ? 'text-[#00C851]' : 'text-[#FF4444]'}`}>
              {item.isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>

        {item.mac && (
          <Text className="mb-0.5 text-sm text-gray-400">
            <Text className="font-medium text-gray-300">MAC: </Text>
            {item.mac}
            {item.vendor ? <Text className="text-gray-400"> ({item.vendor})</Text> : null}
          </Text>
        )}

        {item.hostname && (
          <Text className="mb-0.5 text-sm text-gray-400">
            <Text className="font-medium text-gray-300">Hostname: </Text>
            {item.hostname}
          </Text>
        )}

        <View className="mt-1 flex-row items-center">
          <Text className="mr-2 text-xs text-gray-500">
            via {item.discoveryMethod.toUpperCase()}
          </Text>
        </View>

        {item.services.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
            {item.services.map((svc) => (
              <View
                key={svc}
                className="mr-2 rounded-full border border-[#2196F3] bg-[#1A1A1A] px-3 py-1">
                <Text className="text-xs font-medium text-[#2196F3]">{svc}</Text>
              </View>
            ))}
            {item.openPorts.map((port) => (
              <View
                key={`p${port}`}
                className="mr-2 rounded-full border border-[#00C851] bg-[#1A1A1A] px-3 py-1">
                <Text className="text-xs font-medium text-[#00C851]">{port}</Text>
              </View>
            ))}
          </ScrollView>
        )}
      </TouchableOpacity>
    ),
    [router]
  );

  return (
    <Container>
      <View className="flex-1">
        <Button title="INICIAR SCAN" onPress={iniciar} disabled={isLoading} />

        {isLoading && (
          <View className="mt-4 items-center">
            <ActivityIndicator size="large" color="#2196F3" />
            <Text className="mt-2 text-center text-white">
              {scanPhase === 'mdns'
                ? `mDNS... (${mdnsProgress.completed}/${mdnsProgress.total})`
                : `${phaseLabel(scanPhase)}... (${scanProgress.completed}/${scanProgress.total})`}
            </Text>
          </View>
        )}

        {error && (
          <View className="mt-4 rounded-lg bg-[#FF4444]/20 p-3">
            <Text className="text-center text-sm text-[#FF4444]">{error}</Text>
          </View>
        )}

        {!isLoading && hasScanned && devices.length === 0 && (
          <View className="mt-20 items-center">
            <Text className="text-lg text-gray-400">Nenhum dispositivo encontrado</Text>
          </View>
        )}

        {devices.length > 0 && (
          <Text className="mb-2 mt-4 text-lg font-bold text-white">
            {devices.length} dispositivo(s) encontrado(s)
          </Text>
        )}

        <FlatList
          data={devices}
          keyExtractor={(item) => item.ip}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 12 }}
        />
      </View>
    </Container>
  );
}
