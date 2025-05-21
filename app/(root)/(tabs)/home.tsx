import { useFocusEffect } from 'expo-router'
import React, { useCallback, useState } from 'react'
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
import Ionicons from '@expo/vector-icons/build/Ionicons'

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

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('light-content', true)

      if (Platform.OS === 'web') {
        document.title = 'Home'
      }
      fetchProperties()
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
        const maxLength = 70
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
                <Text className="text-white text-2xl font-semibold capitalize">
                  {item.type}
                  <Text className="normal-case">
                    {item.operation === 'sell' ? ' for sale' : ' for rent'}
                  </Text>
                </Text>

                <Text className="text-white mt-1 text-base capitalize">
                  {item.street} {item.street_number}, {item.locality}
                </Text>

                <View className="flex-row flex-wrap gap-4">
                  <View className="flex-row items-center gap-1">
                    <Text className="text-white text-base">
                      €{item.price.toLocaleString()} {item.operation === 'sell' ? '' : '/ month'} 
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <Ionicons name="resize-outline" size={18} color="white" />
                    <Text className="text-white">{item.size} m²</Text>
                  </View>
                </View>

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
