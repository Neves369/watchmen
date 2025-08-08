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
    <View className="gap-8 p-5">
      <Stack.Screen options={{ title: 'Configurações' }} />
      <View className="rounded-lg bg-[#222] p-5">
        <Text style={{ color: '#fff', fontSize: 18, marginBottom: 12, fontWeight: 'bold' }}>
          Escolha as portas TCP para varredura
        </Text>
        <TextInput
          style={{
            backgroundColor: '#333',
            color: '#fff',
            borderRadius: 8,
            padding: 10,
            marginBottom: 16,
          }}
          value={ports}
          onChangeText={setPorts}
          placeholder="Ex: 22, 80, 443, 8080"
          placeholderTextColor="#aaa"
          keyboardType="numbers-and-punctuation"
        />
        <Text style={{ color: '#ccc', marginBottom: 16 }}>
          Quanto mais portas você escolher, mais tempo pode demorar para finalizar a varredura.
        </Text>
      </View>

      <View className="rounded-lg bg-[#222] p-5">
        <Text style={{ color: '#fff', fontSize: 18, marginBottom: 12, fontWeight: 'bold' }}>
          Timeout
        </Text>
        <TextInput
          style={{
            backgroundColor: '#333',
            color: '#fff',
            borderRadius: 8,
            padding: 10,
            marginBottom: 16,
          }}
          value={timeOut.toString()}
          onChangeText={(e) => {
            setTimeout(Number(e));
          }}
          placeholder="Ex: 22, 80, 443, 8080"
          placeholderTextColor="#aaa"
          keyboardType="numeric"
        />
        <Text style={{ color: '#ccc', marginBottom: 16 }}>
          Escolha o tempo de tentativa de conexão (ms)
        </Text>
      </View>
      <Button title="Confirmar" onPress={handleConfirm} color="#00C851" />
    </View>
  );
}
