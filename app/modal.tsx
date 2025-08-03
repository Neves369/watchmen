import { useState } from 'react';
import { Stack } from 'expo-router';
import { View, Text, TextInput, Button } from 'react-native';

type ModalProps = {
  onConfirm?: (ports: number[]) => void;
  initialPorts?: number[];
};

export default function Modal({ onConfirm, initialPorts = [22, 80, 443] }: ModalProps) {
  const [ports, setPorts] = useState(initialPorts.join(', '));

  const handleConfirm = () => {
    // Converte string para array de números, removendo espaços e entradas inválidas
    const portArray = ports
      .split(',')
      .map((p) => parseInt(p.trim(), 10))
      .filter((p) => !isNaN(p) && p > 0 && p < 65536);
    onConfirm?.(portArray);
  };

  return (
    <View style={{ padding: 24, backgroundColor: '#222', borderRadius: 12 }}>
      <Stack.Screen options={{ title: 'Configurações' }} />
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
      <Button title="Confirmar" onPress={handleConfirm} color="#00C851" />
    </View>
  );
}
