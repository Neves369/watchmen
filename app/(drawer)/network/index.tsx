import { SafeAreaView } from 'react-native-safe-area-context';
import NetworkTabs from '~/components/network/tabs';

export default function Home() {
  return (
    <SafeAreaView style={{ flex: 1, paddingBottom: 15, backgroundColor: '#000' }}>
      <NetworkTabs />
    </SafeAreaView>
  );
}
