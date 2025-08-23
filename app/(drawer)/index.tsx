import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Container } from '~/components/Container';
import { Text, View } from 'react-native';
import { Stack } from 'expo-router';

export default function Home() {
  return (
    <>
      <Stack.Screen options={{ title: 'Watchmen' }} />
      <Container>
        <View className="flex-1 items-center justify-center">
          <MaterialCommunityIcons name="cube-scan" size={200} color="#e5e7eb" />
          <Text className="text-xl font-bold text-gray-200">Selecione um Módulo para iniciar</Text>
        </View>
      </Container>
    </>
  );
}
