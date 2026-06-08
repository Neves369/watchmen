import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import { Container } from '~/components/Container';
import { BluetoothDevice, BleService } from '~/utils/bluetooth/types';
import {
  connectToBleDevice,
  disconnectBleDevice,
  getBleServices,
  readCharacteristic,
} from '~/utils/bluetooth/ble-device';
import {
  connectClassicDevice,
  disconnectClassicDevice,
  sendClassicData,
} from '~/utils/bluetooth/classic-device';
import { bluetoothStore, setConnectedDevice } from '~/store/bluetooth-store';

export default function BluetoothDetalhes() {
  const { data } = useLocalSearchParams<{ data: string }>();
  const device: BluetoothDevice | null = data ? JSON.parse(data) : null;

  const connectedDevice = bluetoothStore((s) => s.connectedDevice);
  const [services, setServices] = useState<BleService[]>([]);
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [charValues, setCharValues] = useState<Record<string, string>>({});
  const [connecting, setConnecting] = useState(false);
  const [classicInput, setClassicInput] = useState('');
  const [classicOutput, setClassicOutput] = useState<string[]>([]);

  if (!device) {
    return (
      <Container>
        <Text className="mt-10 text-center text-white">Dispositivo não encontrado</Text>
      </Container>
    );
  }

  const conectar = async () => {
    setConnecting(true);
    try {
      if (device.transport === 'ble') {
        const ok = await connectToBleDevice(device.id);
        if (ok) {
          setConnectedDevice({ ...device, isConnected: true });
          const svcs = await getBleServices(device.id);
          setServices(svcs);
          ToastAndroid.show('Conectado', ToastAndroid.SHORT);
        }
      } else {
        const ok = await connectClassicDevice(device.mac);
        if (ok) {
          setConnectedDevice({ ...device, isConnected: true });
          ToastAndroid.show('Conectado', ToastAndroid.SHORT);
        }
      }
    } catch (err: any) {
      ToastAndroid.show(`Erro: ${err.message}`, ToastAndroid.SHORT);
    } finally {
      setConnecting(false);
    }
  };

  const desconectar = async () => {
    try {
      if (device.transport === 'ble') {
        await disconnectBleDevice(device.id);
      } else {
        await disconnectClassicDevice();
      }
      setConnectedDevice(null);
      setServices([]);
    } catch {
      // silent
    }
  };

  const lerCaracteristica = async (serviceUuid: string, charUuid: string) => {
    const value = await readCharacteristic(device.id, serviceUuid, charUuid);
    if (value !== null) {
      setCharValues((prev) => ({ ...prev, [charUuid]: value }));
    } else {
      ToastAndroid.show('Falha ao ler característica', ToastAndroid.SHORT);
    }
  };

  const enviarClassico = async () => {
    if (!classicInput.trim()) return;
    const ok = await sendClassicData(classicInput);
    if (ok) {
      setClassicOutput((prev) => [...prev, `>> ${classicInput}`]);
      setClassicInput('');
    } else {
      ToastAndroid.show('Falha ao enviar', ToastAndroid.SHORT);
    }
  };

  const isConnected = connectedDevice?.id === device.id && connectedDevice?.isConnected;

  return (
    <Container>
      <ScrollView className="flex-1 p-5">
        <View className="mb-4 rounded-xl bg-[#2A2A2A] p-5">
          <Text className="text-2xl font-bold text-white">{device.name || 'Desconhecido'}</Text>
          <Text className="mt-1 text-sm text-gray-400">{device.mac}</Text>
          <View className="mt-1 flex-row items-center">
            <View
              className={`mr-2 h-2 w-2 rounded-full ${isConnected ? 'bg-[#00C851]' : 'bg-[#FF4444]'}`}
            />
            <Text className="text-sm text-gray-400">
              {isConnected ? 'Conectado' : 'Desconectado'}
            </Text>
            <Text className="ml-2 text-sm text-gray-500">
              | {device.transport === 'ble' ? 'BLE' : 'Clássico'}
            </Text>
            {device.rssi !== null && (
              <Text className="ml-2 text-sm text-gray-500">RSSI: {device.rssi} dBm</Text>
            )}
          </View>

          <View className="mt-3 flex-row">
            {isConnected ? (
              <TouchableOpacity onPress={desconectar} className="rounded-lg bg-[#FF4444] px-4 py-2">
                <Text className="font-medium text-white">Desconectar</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={conectar}
                disabled={connecting}
                className="rounded-lg bg-[#2196F3] px-4 py-2">
                <Text className="font-medium text-white">
                  {connecting ? 'Conectando...' : 'Conectar'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {isConnected && device.transport === 'ble' && (
          <View className="mb-4 rounded-xl bg-[#2A2A2A] p-5">
            <Text className="mb-3 text-lg font-bold text-white">Serviços</Text>

            {services.length === 0 && <ActivityIndicator size="small" color="#2196F3" />}

            {services.map((svc) => (
              <View key={svc.uuid} className="mb-2">
                <TouchableOpacity
                  onPress={() =>
                    setExpandedService(expandedService === svc.uuid ? null : svc.uuid)
                  }>
                  <Text className="text-sm font-medium text-[#2196F3]">
                    {svc.uuid.length > 20 ? `...${svc.uuid.slice(-20)}` : svc.uuid}
                  </Text>
                </TouchableOpacity>

                {expandedService === svc.uuid && (
                  <View className="ml-3 mt-1 border-l border-gray-600 pl-3">
                    {svc.characteristics.map((char) => (
                      <View key={char.uuid} className="mb-2">
                        <Text className="text-xs text-gray-400">
                          {char.uuid.length > 20 ? `...${char.uuid.slice(-20)}` : char.uuid}
                        </Text>
                        <Text className="text-xs text-gray-500">
                          Propriedades: {char.properties.join(', ') || 'nenhuma'}
                        </Text>

                        {char.properties.includes('read') && (
                          <TouchableOpacity onPress={() => lerCaracteristica(svc.uuid, char.uuid)}>
                            <Text className="mt-1 text-xs text-[#00C851]">Ler valor</Text>
                          </TouchableOpacity>
                        )}

                        {charValues[char.uuid] && (
                          <Text className="mt-1 text-xs text-white">
                            Valor: {charValues[char.uuid]}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {isConnected && device.transport === 'classic' && (
          <View className="mb-4 rounded-xl bg-[#2A2A2A] p-5">
            <Text className="mb-3 text-lg font-bold text-white">Comunicação Serial</Text>

            <ScrollView className="mb-2 max-h-40 rounded-lg bg-[#1A1A1A] p-2">
              {classicOutput.length === 0 && (
                <Text className="text-sm text-gray-500">Nenhum dado trocado</Text>
              )}
              {classicOutput.map((line, i) => (
                <Text key={i} className="text-sm text-white">
                  {line}
                </Text>
              ))}
            </ScrollView>

            <View className="flex-row items-center">
              <TextInput
                value={classicInput}
                onChangeText={setClassicInput}
                placeholder="Digite para enviar..."
                placeholderTextColor="#666"
                className="mr-2 flex-1 rounded-lg bg-[#1A1A1A] px-3 py-2 text-white"
              />
              <TouchableOpacity
                onPress={enviarClassico}
                className="rounded-lg bg-[#2196F3] px-4 py-2">
                <Text className="font-medium text-white">Enviar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </Container>
  );
}
