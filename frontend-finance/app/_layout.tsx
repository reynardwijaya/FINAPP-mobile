import { Stack } from 'expo-router';
import { useCallback } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    // Add your custom fonts here if needed
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <Stack>
        <Stack.Screen 
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="Login"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="(app)"
          options={{
          headerShown: false,
        }}
      />
      </Stack>
    </GestureHandlerRootView>
  );
} 