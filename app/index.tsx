import React, { useCallback } from 'react'

import { Platform, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useFocusEffect, useRouter } from 'expo-router'

import Button from '@/components/common/Button'

import '@/global.css'

const IndexPage = () => {
  const router = useRouter()

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'web') {
        document.title = 'Instarent'
      }
    }, [])
  )

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 p-6">
        <View className="flex-1 items-center justify-center gap-6">
          <Text className="mb-8 text-center text-3xl font-bold">Welcome</Text>
          <View className="w-full max-w-xs gap-4">
            <View className="w-full">
              <Button title="Sign In" onPress={() => router.replace('./(auth)/signin')} />
            </View>
            <View className="w-full">
              <Button title="Sign Up" onPress={() => router.replace('./(auth)/signup')} />
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default IndexPage
