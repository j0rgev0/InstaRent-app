import { useFocusEffect } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

import { INSTARENT_API_KEY, INSTARENT_API_URL } from '@/utils/constants'
import { Property } from '@/utils/types'

const { height, width } = Dimensions.get('window')

const HomePage = () => {
  const [properties, setProperties] = useState<Property[]>([])

  const [expandedDescriptions, setExpandedDescriptions] = useState<string[]>([])

  const fetchProperties = async () => {
    try {
      const response = await fetch(`${INSTARENT_API_URL}/properties`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${INSTARENT_API_KEY}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error getting properties')
      }

      setProperties(data)
    } catch (error) {
      console.error('Error getting properties', error)
    }
  }

  useEffect(() => {
    fetchProperties()
  }, [])

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('light-content', true)

      if (Platform.OS === 'web') {
        document.title = 'Home'
      }
    }, [])
  )

  const toggleDescription = (id: string) => {
    setExpandedDescriptions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  return (
    <FlatList
      data={properties}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        const isExpanded = expandedDescriptions.includes(item.id)
        const maxLength = 100
        const description = item.description

        return (
          <View style={{ height }}>
            <View className="h-full w-full bg-black justify-end">
              <Image
                source={{ uri: item.images[0]?.url }}
                style={{ height, width }}
                className="absolute"
                resizeMode="contain"
              />

              <View className={`p-5 pb-24 ${isExpanded ? 'bg-black/40' : ''}`}>
                <Text className="text-white text-2xl font-semibold capitalize">{item.type}</Text>
                <Text className="text-white mt-1 text-base capitalize">
                  {item.street} {item.street_number}, {item.locality}
                </Text>

                <Text className="text-white mt-1 text-lg font-bold">
                  {isExpanded
                    ? description
                    : description.length > maxLength
                      ? description.slice(0, maxLength) + '...'
                      : description}
                </Text>

                {description.length > maxLength && (
                  <TouchableOpacity onPress={() => toggleDescription(item.id)}>
                    <Text className="text-blue-400 mt-1 font-semibold">
                      {isExpanded ? 'Show less' : 'Show more'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )
      }}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      snapToInterval={height}
      decelerationRate="fast"
    />
  )
}

export default HomePage
