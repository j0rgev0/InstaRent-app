import React, { useCallback, useLayoutEffect } from 'react'

import { FlatList, Text, TouchableOpacity, View } from 'react-native'

import { router, useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router'

import '@/global.css'

const operationTypeOptions = [
  { label: 'Rent', value: 'rent' },
  { label: 'Sell', value: 'sell' }
]

const OperationType = () => {
  const navigation = useNavigation()
  const params = useLocalSearchParams()

  const edit = params.edit === 'true' ? true : false
  const propertyid = params.propertyid

  const {
    operationTypes,
    description,
    housingTypes,
    bathrooms,
    bedrooms,
    size,
    longitude,
    latitude
  } = params

  const sharedParams = {
    operationTypes,
    housingTypes,
    description,
    bathrooms,
    longitude,
    latitude,
    bedrooms,
    size
  }

  const handleSelect = (type: string) => {
    router.replace({
      pathname: '/(root)/(properties)/publish',
      params: {
        ...sharedParams,
        operationTypes: type,
        propertyid,
        edit: edit ? 'true' : 'false'
      }
    })
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Select Operation',
      headerTitleAlign: 'center',
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => {
            router.replace({
              pathname: '/(root)/(properties)/publish',
              params: {
                ...sharedParams,
                propertyid,
                edit: edit ? 'true' : 'false'
              }
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
        data={operationTypeOptions}
        keyExtractor={(item) => item.value}
        renderItem={({ item }) => {
          const isSelected = operationTypes === item.value

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

export default OperationType
