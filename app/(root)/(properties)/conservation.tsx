import React, { useCallback, useLayoutEffect } from 'react'

import { FlatList, Text, TouchableOpacity, View } from 'react-native'

import { router, useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router'

import '@/global.css'

const conservationOptions = [
  { label: 'New', value: 'new' },
  { label: 'Excellent', value: 'excellent' },
  { label: 'Good', value: 'good' },
  { label: 'Fair', value: 'fair' },
  { label: 'To renovate', value: 'to_renovate' },
  { label: 'Ruin', value: 'ruin' }
]

const ConservationOperation = () => {
  const navigation = useNavigation()
  const params = useLocalSearchParams()

  const {
    operationTypes,
    conservation,
    housingTypes,
    description,
    bathrooms,
    bedrooms,
    price,
    size,
    longitude,
    latitude
  } = params

  const sharedParams = {
    operationTypes,
    housingTypes,
    conservation,
    description,
    bathrooms,
    longitude,
    latitude,
    bedrooms,
    price,
    size
  }

  const handleSelect = (type: string) => {
    router.replace({
      pathname: '/(root)/(properties)/publish',
      params: {
        ...sharedParams,
        conservation: type
      }
    })
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Select Condition',
      headerTitleAlign: 'center',
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => {
            router.replace({
              pathname: '/(root)/(properties)/publish',
              params: sharedParams
            })
          }}>
          <Text className="px-4 text-lg text-blue-500">Cancel</Text>
        </TouchableOpacity>
      )
    })
  }, [navigation, sharedParams])

  useFocusEffect(
    useCallback(() => {
      const parent = navigation.getParent()
      if (parent) {
        parent.setOptions({ gestureEnabled: false })
      }
      return () => {
        if (parent) {
          parent.setOptions({ gestureEnabled: true })
        }
      }
    }, [])
  )

  return (
    <View className="flex-1 bg-white px-4 py-6">
      <FlatList
        data={conservationOptions}
        keyExtractor={(item) => item.value}
        renderItem={({ item }) => {
          const isSelected = conservation === item.value
          return (
            <TouchableOpacity
              className={`mb-3 rounded-xl border p-4 ${
                isSelected ? 'border-blue-500 bg-blue-100' : 'border-gray-300'
              }`}
              onPress={() => handleSelect(item.value)}>
              <Text className={`text-lg ${isSelected ? 'text-darkBlue font-semibold' : ''}`}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )
        }}
      />
    </View>
  )
}

export default ConservationOperation
