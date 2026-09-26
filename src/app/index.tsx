import React from 'react';
import { Stack } from 'expo-router';
import MerilCustomerScreen from '../screens/MerilCustomerScreen';

export default function Home() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <MerilCustomerScreen />
    </>
  );
}