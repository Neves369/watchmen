import OSV from './osv';
import OUTRA from './OUTRA';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { KeyboardAvoidingView } from 'react-native';

const Tab = createBottomTabNavigator();

export default function CVETabs() {
  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1">
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen
          name="OSV.DEV"
          options={{
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="radar" size={28} color={color} />
            ),
          }}
          component={OSV}
        />
        <Tab.Screen
          name="OUTRA"
          options={{
            tabBarIcon: ({ color }) => <MaterialIcons name="history" size={28} color={color} />,
          }}
          component={OUTRA}
        />
        <Tab.Screen
          name="OUTRA 2"
          options={{
            tabBarIcon: ({ color }) => <Ionicons name="settings-sharp" size={28} color={color} />,
          }}
          component={OUTRA}
        />
      </Tab.Navigator>
    </KeyboardAvoidingView>
  );
}
