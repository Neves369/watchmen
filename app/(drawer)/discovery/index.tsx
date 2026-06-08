import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import DiscoveryTabs from '~/components/discovery/tabs';

export default function DiscoveryLayout() {
  return (
    <SafeAreaView className="flex-1 bg-black" style={{ paddingBottom: 10 }}>
      <Stack.Screen options={{ title: 'Descoberta' }} />
      <DiscoveryTabs />
    </SafeAreaView>
  );
}
