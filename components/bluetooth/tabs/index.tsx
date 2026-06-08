import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import BluetoothPrincipal from './principal';
import BluetoothPareados from './pareados';
import BluetoothConfig from './configuracoes';

const Tab = createBottomTabNavigator();

export default function BluetoothTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#1A1A1A', height: 60, paddingBottom: 6 },
      }}>
      <Tab.Screen
        name="Scan"
        component={BluetoothPrincipal}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="magnify" size={28} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Pareados"
        component={BluetoothPareados}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="bluetooth" size={28} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Configurações"
        component={BluetoothConfig}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="settings-sharp" size={28} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
