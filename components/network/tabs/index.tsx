import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Principal from './principal'; // Sua tela atual
import Historico from './historico'; // Exemplo de outra aba
import Configuracoes from './configuracoes'; // Exemplo de outra aba
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function NetworkTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="Scan"
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="radar" size={28} color={color} />
          ),
        }}
        component={Principal}
      />
      <Tab.Screen
        name="Histórico"
        options={{
          tabBarIcon: ({ color }) => <MaterialIcons name="history" size={28} color={color} />,
        }}
        component={Historico}
      />
      <Tab.Screen
        name="Configurações"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="settings-sharp" size={28} color={color} />,
        }}
        component={Configuracoes}
      />
    </Tab.Navigator>
  );
}
