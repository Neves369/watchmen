import { useRouter } from 'expo-router';
import { View, Text, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Modal() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ padding: 24, backgroundColor: '#222', borderRadius: 12, gap: 25 }}>
      <Text style={{ color: '#fff', fontSize: 18, marginBottom: 12, fontWeight: 'bold' }}>
        Módulo Network (WIFI)
      </Text>
      <Text style={{ color: '#ccc', marginBottom: 5 }}>
        O módulo de network varre os IPs dentro do range da rede em que o dispositivo está
        conectado, esses IPs representam dispositivos conectados à mesma rede. Se um IP aparece na
        lista, significa que o dispositivo está ativo na rede, pelo menos uma das portas testadas
        está aberta e possivelmente aceita conexão.
      </Text>
      <Text style={{ color: '#ccc', marginBottom: 5 }}>
        Se o dispositvo não aparecer na lista, pode ser que ele não está ativo ou nenhuma das portas
        testadas está abertaou ainda que o firewall do dispositivo bloqueou a conexão.
      </Text>

      <Text style={{ color: '#fff', fontSize: 18, marginBottom: 12, fontWeight: 'bold' }}>
        Módulo Bluetooth
      </Text>
      <Text style={{ color: '#ccc', marginBottom: 5 }}>
        O módulo de network varre os IP's dentro do range da rede em que o dispositivo está
        conectado, esses IP's representam dispositivos conectados à mesma rede. Se um IP aparece na
        lista, significa que o dispositivo está ativo na rede, pelo menos uma das portas testadas
        está aberta e possivelmente aceita conexão.
      </Text>
      <Text style={{ color: '#ccc', marginBottom: 5 }}>
        Se o dispositvo não aparecer na lista, pode ser que ele não está ativo ou nenhuma das portas
        testadas está abertaou ainda que o firewall do dispositivo bloqueou a conexão.
      </Text>
      <Button
        title="Fechar"
        onPress={() => {
          router.back();
        }}
        color="#00C851"
      />
    </SafeAreaView>
  );
}
