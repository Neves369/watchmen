import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { Container } from '~/components/Container';
import { Pressable, Text, View } from 'react-native';
import { Stack, useNavigation } from 'expo-router';

export default function Home() {
  const navigation = useNavigation<any>();

  return (
    <>
      <Stack.Screen options={{ title: 'Watchmen' }} />
      <Container>
        <View className="flex-1 items-center justify-center">
          <Pressable onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
            <MaterialCommunityIcons name="cube-scan" size={200} color="#e5e7eb" />
          </Pressable>
          <Text className="text-xl font-bold text-gray-200">Selecione um Módulo para iniciar</Text>
        </View>
      </Container>
    </>
  );
}
