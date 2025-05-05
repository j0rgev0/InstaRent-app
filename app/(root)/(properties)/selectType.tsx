import React, { useCallback, useLayoutEffect } from 'react'

import { FlatList, Text, TouchableOpacity, View } from 'react-native'

import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from 'expo-router'

import '@/global.css'

const housingTypeOptions = [
  { label: 'Rural Property', value: 'ruralproperty' },
  { label: 'Ground Floor', value: 'groundfloor' },
  { label: 'Townhouse', value: 'townhouse' },
  { label: 'Apartment', value: 'apartment' },
  { label: 'Penthouse', value: 'penthouse' },
  { label: 'Chalet', value: 'chalet' },
  { label: 'Duplex', value: 'duplex' },
  { label: 'Studio', value: 'studio' },
  { label: 'Loft', value: 'loft' },
  { label: 'Other', value: 'other' }
]

const SelectType = () => {
  const navigation = useNavigation()
  const router = useRouter()
  const params = useLocalSearchParams()

  const {
    operationTypes,
    description,
    housingTypes,
    bathrooms,
    bedrooms,
    price,
    size,
    longitude,
    latitude
  } = params

  const sharedParams = {
    operationTypes,
    bathrooms,
    description,
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
        housingTypes: type
      }
    })
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Select Type',
      headerTitleAlign: 'center',
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => {
            router.replace({
              pathname: '/(root)/(properties)/publish',
              params: {
                ...sharedParams,
                housingTypes
              }
            })
          }}>
          <Text className="px-4 text-lg text-blue-500">Cancel</Text>
        </TouchableOpacity>
      )
    })
  }, [navigation, sharedParams, housingTypes])

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
        data={housingTypeOptions}
        keyExtractor={(item) => item.value}
        renderItem={({ item }) => {
          const isSelected = housingTypes === item.value
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

export default SelectType
