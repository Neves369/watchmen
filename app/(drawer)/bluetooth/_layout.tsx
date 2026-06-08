import { Stack } from 'expo-router';

export default function BluetoothLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#1A1A1A' },
        headerTintColor: '#fff',
      }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="detalhes" options={{ title: 'Dispositivo Bluetooth' }} />
    </Stack>
  );
}
