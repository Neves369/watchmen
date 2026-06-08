import { SafeAreaView } from 'react-native-safe-area-context';
import NetworkTabs from '~/components/network/tabs';

export default function Home() {
  return (
    <SafeAreaView className="flex-1 bg-black" style={{ paddingBottom: 15 }}>
      <NetworkTabs />
    </SafeAreaView>
  );
}
