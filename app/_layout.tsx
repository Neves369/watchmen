import '../global.css';
import { Stack } from 'expo-router';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';

export const unstable_settings = {
  initialRouteName: '(drawer)',
};

export default function RootLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <StatusBar style="light" />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack screenOptions={{ navigationBarHidden: true }}>
          <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ title: 'Modal', presentation: 'modal' }} />
        </Stack>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
