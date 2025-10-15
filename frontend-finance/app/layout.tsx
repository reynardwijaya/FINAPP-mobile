import React from "react";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../app/Login';

const Stack = createNativeStackNavigator();

export default function Tablayout() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={Login} />
    </Stack.Navigator>
  );
}
