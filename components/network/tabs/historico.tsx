import { Stack } from 'expo-router';
import { useCallback, useState } from 'react';
import { Container } from '~/components/Container';
import { global, updateStore } from '~/store/store';
import { View, Text, FlatList } from 'react-native';

export default function Home() {
  const store = global((state) => state);
  const [historico, setHistorico] = useState(store.historico);

  const renderItem = useCallback(({ item }: any) => {
    return (
      <View className="my-2 w-full self-center rounded-lg bg-[#2A2A2A] p-4 shadow-md shadow-black">
        <View className="mb-3 justify-between">
          <Text className="mb-5 text-2xl font-bold text-white">{item.timestamp}</Text>
          {item.results.map((item: any) => {
            return (
              <View key={`${item.ip}+ ${item.port}`} className="flex-row items-center">
                <Text className="text-sm font-medium text-[#00C851]">
                  {`${item.ip}: ${item.port}`}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  }, []);

  return (
    <>
      <Stack.Screen options={{ title: 'Histórico' }} />
      <Container>
        <FlatList
          data={historico}
          numColumns={1}
          // keyExtractor={(item) => }
          renderItem={renderItem}
          contentContainerStyle={{ width: '100%', alignSelf: 'center', paddingVertical: 12 }}
        />
      </Container>
    </>
  );
}
