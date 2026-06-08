import { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import { Container } from '~/components/Container';
import { Button } from '~/components/Button';
import { bluetoothStore, setBondedDevices } from '~/store/bluetooth-store';
import { BluetoothDevice } from '~/utils/bluetooth/types';
import { getBondedClassicDevices } from '~/utils/bluetooth/classic-scanner';

export default function BluetoothPareados() {
  const router = useRouter();
  const bondedDevices = bluetoothStore((s) => s.bondedDevices);
  const [loading, setLoading] = useState(false);

  const carregarPareados = async () => {
    setLoading(true);
    try {
      const devices = await getBondedClassicDevices();
      setBondedDevices(devices);
      ToastAndroid.show(`${devices.length} dispositivo(s) pareado(s)`, ToastAndroid.SHORT);
    } catch (err: any) {
      ToastAndroid.show(`Erro: ${err.message}`, ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = useCallback(
    ({ item }: { item: BluetoothDevice }) => (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: '/bluetooth/detalhes',
            params: { data: JSON.stringify(item) },
          })
        }
        className="my-1.5 w-full self-center rounded-lg bg-[#2A2A2A] p-4 shadow-md shadow-black">
        <Text className="text-lg font-bold text-white">{item.name || 'Desconhecido'}</Text>
        <Text className="mt-0.5 text-sm text-gray-400">{item.mac}</Text>
        <Text className="mt-0.5 text-xs text-gray-500">Clássico</Text>
      </TouchableOpacity>
    ),
    [router]
  );

  return (
    <Container>
      <View className="flex-1">
        <Button title="CARREGAR PAREADOS" onPress={carregarPareados} disabled={loading} />

        {loading && (
          <View className="mt-4 items-center">
            <ActivityIndicator size="large" color="#2196F3" />
          </View>
        )}

        {bondedDevices.length > 0 && (
          <Text className="mb-2 mt-4 text-lg font-bold text-white">
            {bondedDevices.length} dispositivo(s) pareado(s)
          </Text>
        )}

        {!loading && bondedDevices.length === 0 && (
          <View className="mt-20 items-center">
            <Text className="text-lg text-gray-400">Nenhum dispositivo pareado</Text>
          </View>
        )}

        <FlatList
          data={bondedDevices}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 12 }}
        />
      </View>
    </Container>
  );
}
