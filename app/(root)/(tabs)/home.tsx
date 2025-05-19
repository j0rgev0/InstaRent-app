import React, { useCallback } from 'react'

import { Platform, Text, View } from 'react-native'

import '@/global.css'
import { useFocusEffect, useNavigation } from 'expo-router'

const HomePage = () => {
  const navigation = useNavigation()

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'web') {
        document.title = 'Home'
      }
    }, [])
  )
  return (
    <View className="flex-1 items-center justify-center bg-gray-50 pt-10">
      <Text>Welcome to the Home Page</Text>
    </View>
  )
}

export default HomePage
