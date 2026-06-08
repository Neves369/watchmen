import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { DiscoveredDevice } from '~/store/discovery-store';

export default function DeviceDetalhes() {
  const router = useRouter();
  const params = useLocalSearchParams();

  let device: DiscoveredDevice | null = null;
  try {
    if (params.data) {
      device = JSON.parse(params.data as string);
    }
  } catch {}

  if (!device) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <View className="flex-1 items-center justify-center p-5">
          <Text className="mb-4 text-lg text-gray-400">Dispositivo não encontrado</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="rounded-lg bg-[#00C851] px-6 py-3">
            <Text className="font-bold text-black">Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const infoRows = [
    { label: 'IP', value: device.ip },
    { label: 'MAC', value: device.mac || 'Não disponível' },
    { label: 'Fabricante', value: device.vendor || 'Desconhecido' },
    { label: 'Hostname', value: device.hostname || 'Não disponível' },
    { label: 'Descoberto via', value: device.discoveryMethod.toUpperCase() },
    { label: 'Primeira vez visto', value: device.firstSeen },
    { label: 'Última vez visto', value: device.lastSeen },
  ];

  return (
    <SafeAreaView className="flex-1 bg-black">
      <Stack.Screen
        options={{
          title: device.ip,
          headerStyle: { backgroundColor: '#1A1A1A' },
          headerTintColor: '#fff',
        }}
      />
      <ScrollView className="flex-1 p-5">
        <View className="mb-6 flex-row items-center justify-between">
          <Text className="text-3xl font-bold text-white">{device.ip}</Text>
          <View className="flex-row items-center">
            <View
              className={`mr-2 h-3 w-3 rounded-full ${device.isOnline ? 'bg-[#00C851]' : 'bg-[#FF4444]'}`}
            />
            <Text
              className={`text-lg font-bold ${device.isOnline ? 'text-[#00C851]' : 'text-[#FF4444]'}`}>
              {device.isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>

        <View className="rounded-xl bg-[#2A2A2A] p-5">
          {infoRows.map((row) => (
            <View
              key={row.label}
              className="mb-4 flex-row items-start justify-between border-b border-gray-700 pb-2">
              <Text className="text-base font-medium text-gray-400">{row.label}</Text>
              <Text className="max-w-[60%] text-right text-base text-white">{row.value}</Text>
            </View>
          ))}
        </View>

        {device.services.length > 0 && (
          <View className="mt-6">
            <Text className="mb-3 text-lg font-bold text-white">
              Serviços ({device.services.length})
            </Text>
            <View className="flex-row flex-wrap">
              {device.services.map((svc) => (
                <View
                  key={svc}
                  className="mb-2 mr-2 rounded-full border border-[#2196F3] bg-[#1A1A1A] px-4 py-2">
                  <Text className="text-sm font-medium text-[#2196F3]">{svc}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {device.openPorts.length > 0 && (
          <View className="mt-6">
            <Text className="mb-3 text-lg font-bold text-white">
              Portas ({device.openPorts.length})
            </Text>
            <View className="flex-row flex-wrap">
              {device.openPorts.map((port) => (
                <View
                  key={port}
                  className="mb-2 mr-2 rounded-full border border-[#00C851] bg-[#1A1A1A] px-4 py-2">
                  <Text className="text-sm font-medium text-[#00C851]">{port}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
