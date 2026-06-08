import { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import { Button } from '~/components/Button';
import { Container } from '~/components/Container';
import {
  bluetoothStore,
  addDevice,
  clearDevices,
  setLoading,
  setScanning,
  setError,
  setConnectedDevice,
  defaultConfig,
} from '~/store/bluetooth-store';
import { BluetoothDevice } from '~/utils/bluetooth/types';
import { requestBlePermissions, startBleScan } from '~/utils/bluetooth/ble-scanner';
import { requestClassicPermissions, startClassicScan } from '~/utils/bluetooth/classic-scanner';
import { connectToBleDevice, disconnectBleDevice } from '~/utils/bluetooth/ble-device';
import { connectClassicDevice, disconnectClassicDevice } from '~/utils/bluetooth/classic-device';

export default function BluetoothPrincipal() {
  const router = useRouter();
  const devices = bluetoothStore((s) => s.devices);
  const isLoading = bluetoothStore((s) => s.isLoading);
  const isScanning = bluetoothStore((s) => s.isScanning);
  const error = bluetoothStore((s) => s.error);
  const [config] = useState(defaultConfig);
  const [hasScanned, setHasScanned] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const iniciar = async () => {
    clearDevices();
    setLoading(true);
    setScanning(true);
    setError(null);
    setHasScanned(false);

    try {
      if (config.enableBle) {
        const bleOk = await requestBlePermissions();
        if (!bleOk) {
          setError('Permissão BLE negada');
          setScanning(false);
          setLoading(false);
          return;
        }
      }
      if (config.enableClassic) {
        const classicOk = await requestClassicPermissions();
        if (!classicOk) {
          setError('Permissão Bluetooth Clássico negada');
          setScanning(false);
          setLoading(false);
          return;
        }
      }

      let bleFinished = false;
      let classicFinished = false;

      const checkDone = () => {
        if (bleFinished && classicFinished) {
          const count = bluetoothStore.getState().devices.length;
          setScanning(false);
          setHasScanned(true);
          setLoading(false);
          ToastAndroid.show(`${count} dispositivo(s) Bluetooth encontrado(s)`, ToastAndroid.LONG);
        }
      };

      if (config.enableBle) {
        startBleScan(
          config.scanDuration,
          (device) => addDevice(device),
          () => {
            bleFinished = true;
            checkDone();
          }
        );
      } else {
        bleFinished = true;
      }

      if (config.enableClassic) {
        startClassicScan(
          config.scanDuration,
          (device) => addDevice(device),
          () => {
            classicFinished = true;
            checkDone();
          }
        );
      } else {
        classicFinished = true;
      }

      checkDone();
    } catch (err: any) {
      setError(err.message);
      setScanning(false);
      setLoading(false);
    }
  };

  const conectar = async (device: BluetoothDevice) => {
    setConnectingId(device.id);
    try {
      let connected = false;
      if (device.transport === 'ble') {
        connected = await connectToBleDevice(device.id);
        if (connected) {
          setConnectedDevice({ ...device, isConnected: true });
          ToastAndroid.show(`Conectado a ${device.name || device.mac}`, ToastAndroid.SHORT);
        }
      } else {
        connected = await connectClassicDevice(device.mac);
        if (connected) {
          setConnectedDevice({ ...device, isConnected: true });
          ToastAndroid.show(`Conectado a ${device.name || device.mac}`, ToastAndroid.SHORT);
        }
      }
    } catch (err: any) {
      ToastAndroid.show(`Erro ao conectar: ${err.message}`, ToastAndroid.SHORT);
    } finally {
      setConnectingId(null);
    }
  };

  const desconectar = async (device: BluetoothDevice) => {
    try {
      if (device.transport === 'ble') {
        await disconnectBleDevice(device.id);
      } else {
        await disconnectClassicDevice();
      }
      setConnectedDevice(null);
      ToastAndroid.show(`Desconectado de ${device.name || device.mac}`, ToastAndroid.SHORT);
    } catch (err: any) {
      ToastAndroid.show(`Erro ao desconectar: ${err.message}`, ToastAndroid.SHORT);
    }
  };

  const renderItem = useCallback(
    ({ item }: { item: BluetoothDevice }) => {
      const isThisConnecting = connectingId === item.id;
      return (
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: '/bluetooth/detalhes',
              params: { data: JSON.stringify(item) },
            })
          }
          className="my-1.5 w-full self-center rounded-lg bg-[#2A2A2A] p-4 shadow-md shadow-black">
          <View className="mb-1 flex-row items-center justify-between">
            <Text className="flex-1 text-lg font-bold text-white">
              {item.name || 'Desconhecido'}
            </Text>
            <View className="ml-2 flex-row items-center">
              <View
                className={`mr-1.5 h-2 w-2 rounded-full ${item.isConnected ? 'bg-[#00C851]' : 'bg-[#FF4444]'}`}
              />
              <Text className="text-xs text-gray-400">{item.isConnected ? 'Conectado' : ''}</Text>
            </View>
          </View>
          <Text className="mb-0.5 text-sm text-gray-400">{item.mac}</Text>
          <View className="flex-row items-center">
            <Text className="text-xs text-gray-500">
              {item.transport === 'ble' ? 'BLE' : 'Clássico'}
            </Text>
            {item.rssi !== null && (
              <Text className="ml-2 text-xs text-gray-500">RSSI: {item.rssi} dBm</Text>
            )}
          </View>
          {item.serviceUuids && item.serviceUuids.length > 0 && (
            <Text className="mt-1 text-xs text-gray-500">
              {item.serviceUuids.length} serviço(s)
            </Text>
          )}
          {item.isConnected ? (
            <TouchableOpacity
              onPress={() => desconectar(item)}
              className="mt-2 self-start rounded-lg bg-[#FF4444] px-3 py-1">
              <Text className="text-xs font-medium text-white">Desconectar</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => conectar(item)}
              disabled={isThisConnecting}
              className="mt-2 self-start rounded-lg bg-[#2196F3] px-3 py-1">
              <Text className="text-xs font-medium text-white">
                {isThisConnecting ? 'Conectando...' : 'Conectar'}
              </Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      );
    },
    [router, connectingId]
  );

  return (
    <Container>
      <View className="flex-1">
        <Button title="INICIAR SCAN" onPress={iniciar} disabled={isLoading} />

        {isScanning && (
          <View className="mt-4 items-center">
            <ActivityIndicator size="large" color="#2196F3" />
            <Text className="mt-2 text-white">Escaneando dispositivos Bluetooth...</Text>
          </View>
        )}

        {error && (
          <View className="mt-4 rounded-lg bg-[#FF4444]/20 p-3">
            <Text className="text-center text-sm text-[#FF4444]">{error}</Text>
          </View>
        )}

        {!isScanning && hasScanned && devices.length === 0 && (
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
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 12 }}
        />
      </View>
    </Container>
  );
}
