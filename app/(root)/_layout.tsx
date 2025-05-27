import { authClient } from '@/lib/auth-client'
import { Redirect, Stack } from 'expo-router'
import React from 'react'
import { ActivityIndicator, View } from 'react-native'

export default function RootLayout() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    )
  }

  if (!session) {
    return <Redirect href="/" />
  }

  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{
          headerTitle: '',
          headerShown: false
        }}
      />
      <Stack.Screen
        name="(editProfile)"
        options={{
          headerTitle: 'Edit profile',
          headerTitleAlign: 'center',
          headerShown: false
        }}
      />
      <Stack.Screen
        name="(properties)"
        options={{
          headerTitle: 'Properties',
          headerTitleAlign: 'center',
          headerShown: false
        }}
      />
    </Stack>
  )
}
