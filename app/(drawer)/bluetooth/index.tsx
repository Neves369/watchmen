import { SafeAreaView } from 'react-native-safe-area-context';
import BluetoothTabs from '~/components/bluetooth/tabs';

export default function BluetoothScreen() {
  return (
    <SafeAreaView className="flex-1 bg-black">
      <BluetoothTabs />
    </SafeAreaView>
  );
}
