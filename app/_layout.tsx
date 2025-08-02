import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import 'react-native-reanimated';

import { AuthProvider } from '@/contexts/AuthContext';

// Custom light theme
const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#007AFF',
    background: '#F2F2F7',
    card: '#FFFFFF',
    text: '#1D1D1F',
    border: '#E5E5EA',
    notification: '#FF3B30',
  },
};

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Show light loading screen
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: '#F2F2F7', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }} />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F2F2F7' }}>
      <AuthProvider>
        <ThemeProvider value={LightTheme}>
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: '#FFFFFF',
              },
              headerTintColor: '#1D1D1F',
              headerTitleStyle: {
                color: '#1D1D1F',
              },
              contentStyle: {
                backgroundColor: '#F2F2F7',
                paddingBottom: 0, // Remove extra padding that might interfere
              },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ 
              headerShown: false,
              contentStyle: { 
                backgroundColor: '#F2F2F7',
                flex: 1, // Ensure proper flex layout
              }
            }} />
            <Stack.Screen name="booking" options={{ 
              headerShown: false,
              contentStyle: { backgroundColor: '#F2F2F7' }
            }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="dark" backgroundColor="#FFFFFF" />
        </ThemeProvider>
      </AuthProvider>
    </View>
  );
}
