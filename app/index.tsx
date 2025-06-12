import Button from '@/components/common/Button'
import '@/global.css'
import { useFocusEffect, useRouter } from 'expo-router'
import React, { useCallback } from 'react'
import { Platform, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

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
        <View className="flex-1 items-center justify-center gap-8">
          <View className="items-center gap-2">
            <Text className="text-4xl font-bold text-darkBlue">Welcome to InstaRent</Text>
            <Text className="text-lg text-gray-600 text-center">
              Your trusted platform for property rentals
            </Text>
          </View>

          <View className="w-full max-w-xs gap-4 mt-8">
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
