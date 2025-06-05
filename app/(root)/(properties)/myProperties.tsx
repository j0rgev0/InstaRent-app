import { router } from 'expo-router'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Platform, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native'
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler'

import { authClient } from '@/lib/auth-client'

import PropertyPreview from '@/components/properties/PropertyPreview'

import { INSTARENT_API_KEY, INSTARENT_API_URL } from '@/utils/constants'
import { Property } from '@/utils/types'

import '@/global.css'
import { fetchWithErrorHandling, handleNetworkError } from '@/utils/error-handler'
import { useFocusEffect } from 'expo-router'

const MyProperties = () => {
  const { data: session } = authClient.useSession()
  const userid = session?.user.id
  const [properties, setProperties] = useState<Property[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const swipeableRef = useRef<Swipeable | null>(null)

  const fetchProperties = async () => {
    if (!userid) return
    try {
      const response = await fetchWithErrorHandling(
        `${INSTARENT_API_URL}/properties?userid=${userid}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${INSTARENT_API_KEY}`
          }
        }
      )

      const data = await response.json()
      setProperties(data || [])
    } catch (error) {
      if (error instanceof Error && error.message !== 'No properties found') {
        handleNetworkError(error, 'Error getting properties')
      }
      setProperties([])
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchProperties()
    setRefreshing(false)
  }

  useEffect(() => {
    fetchProperties()
  }, [userid])

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'web') {
        document.title = 'My Properties'
      }
    }, [])
  )

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView
        className="bg-white px-4 pt-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {properties.length === 0 ? (
          <View className="flex-1 items-center justify-center min-h-[80vh]">
            <Text className="text-xl text-gray-600 mb-4">You don't have any properties yet</Text>
            <Pressable
              onPress={() => router.push('/publish')}
              className="bg-blue-500 px-6 py-3 rounded-lg">
              <Text className="text-white font-semibold">Publish a Property</Text>
            </Pressable>
          </View>
        ) : (
          properties.map((property) => (
            <PropertyPreview
              key={property.id}
              property={property}
              swipeableRef={swipeableRef}
              onDelete={fetchProperties}
            />
          ))
        )}
      </ScrollView>
    </GestureHandlerRootView>
  )
}

export default MyProperties
