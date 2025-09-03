import CVETabs from '~/components/cves/tabs';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {
  return (
    <SafeAreaView style={{ flex: 1, paddingBottom: 15, backgroundColor: '#000' }}>
          <CVETabs />
        </SafeAreaView>
  );
}
