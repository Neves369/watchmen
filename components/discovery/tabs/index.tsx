import DiscoveryPrincipal from './principal';
import DiscoveryConfig from './configuracoes';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator();

export default function DiscoveryTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#1A1A1A' },
        tabBarIconStyle: { marginBottom: 0 },
      }}>
      <Tab.Screen
        name="Scan"
        options={{
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="wifi" size={28} color={color} />,
        }}
        component={DiscoveryPrincipal}
      />
      <Tab.Screen
        name="Configurações"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="settings-sharp" size={28} color={color} />,
        }}
        component={DiscoveryConfig}
      />
    </Tab.Navigator>
  );
}
