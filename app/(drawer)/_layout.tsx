import { Link } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { FontAwesome, Ionicons } from '@expo/vector-icons';

import { HeaderButton } from '../../components/HeaderButton';

const DrawerLayout = () => {
  return (
    <Drawer>
      <Drawer.Screen
        name="index"
        options={{
          headerTitle: 'Watchmen',
          drawerLabel: 'Home',
          drawerIcon: ({ size, color }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="discovery"
        options={{
          headerTitle: 'Descoberta de Dispositivos',
          drawerLabel: 'Discovery',
          drawerIcon: ({ size, color }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="network/index"
        options={{
          headerTitle: 'Varredura de Rede',
          drawerLabel: 'Network',
          drawerIcon: ({ size, color }) => <FontAwesome name="wifi" size={size} color={color} />,
          headerRight: () => (
            <Link href="/modal" asChild>
              <HeaderButton />
            </Link>
          ),
        }}
      />
      <Drawer.Screen
        name="bluetooth"
        options={{
          headerTitle: 'Varredura de Bluetooth',
          drawerLabel: 'Bluetooth',
          drawerIcon: ({ size, color }) => (
            <FontAwesome name="bluetooth-b" size={size} color={color} />
          ),
          headerRight: () => (
            <Link href="/modal" asChild>
              <HeaderButton />
            </Link>
          ),
        }}
      />
    </Drawer>
  );
};

export default DrawerLayout;
