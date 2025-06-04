import React, { useEffect } from 'react'

import { ActivityIndicator, SafeAreaView, View } from 'react-native'

import { Stack, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

import { authClient } from '@/lib/auth-client'

import '@/global.css'

export default function AppLayout() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()

  useEffect(() => {
    if (session) {
      router.replace('/home')
    }
  }, [session])

  if (isPending) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </SafeAreaView>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
            animation: 'none'
          }}
        />
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen
          name="(root)"
          options={{
            headerShown: false
          }}
        />
      </Stack>
    </View>
  )
}
