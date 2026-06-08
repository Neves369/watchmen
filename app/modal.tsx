import { useRouter } from 'expo-router';
import { View, Text, Button, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Modal() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-black p-5">
      <ScrollView className="gap-6">
        <View className="rounded-xl bg-[#2A2A2A] p-5">
          <Text className="mb-3 text-lg font-bold text-white">Módulo Network (WIFI)</Text>
          <Text className="mb-2 text-sm text-gray-400">
            O módulo de network varre os IPs dentro do range da rede em que o dispositivo está
            conectado, esses IPs representam dispositivos conectados à mesma rede. Se um IP aparece
            na lista, significa que o dispositivo está ativo na rede, pelo menos uma das portas
            testadas está aberta e possivelmente aceita conexão.
          </Text>
          <Text className="text-sm text-gray-400">
            Se o dispositivo não aparecer na lista, pode ser que ele não está ativo ou nenhuma das
            portas testadas está aberta ou ainda que o firewall do dispositivo bloqueou a conexão.
          </Text>
        </View>

        <View className="rounded-xl bg-[#2A2A2A] p-5">
          <Text className="mb-3 text-lg font-bold text-white">Módulo Bluetooth</Text>
          <Text className="mb-2 text-sm text-gray-400">
            O módulo Bluetooth descobre dispositivos BLE e Bluetooth Clássico próximos, permitindo
            conectar, ler características (BLE) e enviar/receber dados seriais (Clássico).
          </Text>
          <Text className="text-sm text-gray-400">
            Para BLE, é possível navegar pelos serviços e características do dispositivo após a
            conexão. Para Bluetooth Clássico, um terminal serial permite comunicação bidirecional
            via RFCOMM.
          </Text>
        </View>

        <Button title="Fechar" onPress={() => router.back()} color="#00C851" />
      </ScrollView>
    </SafeAreaView>
  );
}
