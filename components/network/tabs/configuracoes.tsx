import { useState } from 'react';
import { Stack } from 'expo-router';
import { global, updateStore } from '~/store/store';
import { View, Text, TextInput, Button } from 'react-native';

export default function Configuracoes() {
  const store = global((state) => state);
  const [timeOut, setTimeout] = useState(store.timeout);
  const [ports, setPorts] = useState(store.portas.join(';'));

  const handleConfirm = () => {
    const portArray = ports
      .split(';')
      .map((p) => parseInt(p.trim(), 10))
      .filter((p) => !isNaN(p) && p > 0 && p < 65536);

    updateStore((state) => {
      state.portas = portArray;
      state.timeout = timeOut;
    });
  };

  return (
    <View className="flex-1 gap-6 bg-black p-5">
      <Stack.Screen options={{ title: 'Configurações' }} />
      <View className="rounded-xl bg-[#2A2A2A] p-5">
        <Text className="mb-4 text-lg font-bold text-white">Portas TCP</Text>
        <TextInput
          className="mb-2 rounded-lg bg-[#333] p-3 text-base text-white"
          value={ports}
          onChangeText={setPorts}
          placeholder="Ex: 22;80;443;8080"
          placeholderTextColor="#888"
          keyboardType="numbers-and-punctuation"
        />
        <Text className="text-sm text-gray-500">
          Quanto mais portas você escolher, mais tempo pode demorar para finalizar a varredura.
        </Text>
      </View>

      <View className="rounded-xl bg-[#2A2A2A] p-5">
        <Text className="mb-4 text-lg font-bold text-white">Timeout (ms)</Text>
        <TextInput
          className="mb-2 rounded-lg bg-[#333] p-3 text-base text-white"
          value={timeOut.toString()}
          onChangeText={(e) => setTimeout(Number(e))}
          placeholder="5000"
          placeholderTextColor="#888"
          keyboardType="numeric"
        />
        <Text className="text-sm text-gray-500">Tempo limite para cada tentativa de conexão</Text>
      </View>
      <Button title="SALVAR" onPress={handleConfirm} color="#00C851" />
    </View>
  );
}
