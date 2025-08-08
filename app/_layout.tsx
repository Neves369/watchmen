import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export const unstable_settings = {
  initialRouteName: '(drawer)',
};

export default function RootLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <StatusBar style="light" backgroundColor="black" />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack screenOptions={{ navigationBarHidden: true }}>
          <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{ title: 'Modal', presentation: 'modal', headerShown: false }}
          />
        </Stack>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
