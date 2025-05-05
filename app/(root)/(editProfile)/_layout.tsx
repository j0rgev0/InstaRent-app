import React from 'react'

import { Alert, Platform, Text, TouchableOpacity } from 'react-native'

import { Ionicons } from '@expo/vector-icons'
import { router, Stack } from 'expo-router'

import { authClient } from '@/lib/auth-client'

import '@/global.css'

export default function RootLayout() {
  const { data: session } = authClient.useSession()

  return (
    <Stack>
      <Stack.Screen
        name="editProfile"
        options={{
          headerShown: true,
          presentation: 'card',
          headerTitleAlign: 'center',
          headerTitle: 'Edit profile',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Alert.alert(
                    'Discard changes?',
                    'If you go back now, you will lose your changes.',
                    [
                      {
                        text: 'Discard changes',
                        onPress: () => router.back(),
                        style: 'destructive'
                      },
                      {
                        text: 'Keep editing',
                        style: 'cancel'
                      }
                    ]
                  )
                } else {
                  router.back()
                }
              }}
              className="flex flex-row items-center">
              <Ionicons name="chevron-back-sharp" size={32} color={'black'} />
              <Text className="text-lg text-black">{session?.user.name}</Text>
            </TouchableOpacity>
          )
        }}
      />
      <Stack.Screen
        name="changePassword"
        options={{
          headerShown: true,
          presentation: 'modal',
          gestureEnabled: false,
          headerTitleAlign: 'center',
          headerTitle: 'Change Password',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Alert.alert(
                    'Discard changes?',
                    'If you go back now, you will lose your changes.',
                    [
                      {
                        text: 'Discard changes',
                        onPress: () => router.back(),
                        style: 'destructive'
                      },
                      {
                        text: 'Keep editing',
                        style: 'cancel'
                      }
                    ]
                  )
                } else {
                  router.back()
                }
              }}>
              <Text className="px-4 text-lg text-blue-500">Cancel</Text>
            </TouchableOpacity>
          )
        }}
      />
      <Stack.Screen
        name="changeEmail"
        options={{
          headerShown: true,
          presentation: 'modal',
          gestureEnabled: false,
          headerTitleAlign: 'center',
          headerTitle: 'Change Email',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Alert.alert(
                    'Discard changes?',
                    'If you go back now, you will lose your changes.',
                    [
                      {
                        text: 'Discard changes',
                        onPress: () => router.back(),
                        style: 'destructive'
                      },
                      {
                        text: 'Keep editing',
                        style: 'cancel'
                      }
                    ]
                  )
                } else {
                  router.back()
                }
              }}>
              <Text className="px-4 text-lg text-blue-500">Cancel</Text>
            </TouchableOpacity>
          )
        }}
      />
    </Stack>
  )
}
