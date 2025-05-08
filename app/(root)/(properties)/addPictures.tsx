import React from 'react'

import { useLocalSearchParams } from 'expo-router'
import { Text, View } from 'react-native'

import '@/global.css'

const addPictures = () => {
  const params = useLocalSearchParams()
  const propertyId = params.propertyId

  return (
    <View className="flex-1 items-center justify-center bg-gray-50 pt-10">
      <Text>Welcome add Pictures to {propertyId}</Text>
    </View>
  )
}

export default addPictures
