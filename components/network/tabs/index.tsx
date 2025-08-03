import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Principal from './principal'; // Sua tela atual
import Historico from './historico'; // Exemplo de outra aba
import Configuracoes from './configuracoes'; // Exemplo de outra aba

const Tab = createBottomTabNavigator();

export default function NetworkTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Scan" component={Principal} />
      <Tab.Screen name="Histórico" component={Historico} />
      <Tab.Screen name="Configurações" component={Configuracoes} />
    </Tab.Navigator>
  );
}
