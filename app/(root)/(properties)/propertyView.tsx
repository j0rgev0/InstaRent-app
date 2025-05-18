import { INSTARENT_API_KEY, INSTARENT_API_URL } from '@/utils/constants'
import { Property } from '@/utils/types'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

// @ts-ignore
import MapPreview from '@/components/map/MapPreview'

const { width } = Dimensions.get('window')

const PropertyView = () => {
  const navigation = useNavigation()
  const params = useLocalSearchParams()

  const propertyId = params.propertyId
  const [property, setProperty] = useState<Property>()
  const [refreshing, setRefreshing] = useState(false)

  const fetchProperty = async () => {
    if (!propertyId) return
    try {
      const response = await fetch(`${INSTARENT_API_URL}/properties/${propertyId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${INSTARENT_API_KEY}`
        }
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Error getting property')

      setProperty(data)
    } catch (error) {
      console.error('Error getting property', error)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchProperty()
    setRefreshing(false)
  }

  useEffect(() => {
    fetchProperty()
  }, [propertyId])

  if (!property) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#353949" />
      </View>
    )
  }

  return (
    <ScrollView
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      className="bg-white">
      <FlatList
        data={property.images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Image source={{ uri: item.url }} style={{ width, height: 300 }} resizeMode="cover" />
        )}
      />

      <View className="p-4">
        <Text className="text-xl font-bold text-black mb-1 capitalize">
          {property.type}
          <Text className="normal-case"> in </Text>
          {property.street}, {property.locality}
        </Text>
        <Text className="text-lg text-[#353949] font-semibold mb-2">
          €{property.price.toLocaleString()} {property.operation === 'sell' ? '' : '/ month'}
        </Text>

        <View className="flex-row flex-wrap gap-4 mb-4">
          <View className="flex-row items-center gap-1">
            <Ionicons name="bed-outline" size={18} color="#555" />
            <Text>{property.bedrooms} Beds</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="water-outline" size={18} color="#555" />
            <Text>{property.bathrooms} Baths</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="resize-outline" size={18} color="#555" />
            <Text>{property.size} m²</Text>
          </View>
        </View>

        <Text className="text-gray-700 mb-6">{property.description}</Text>

        {property.features.length > 0 && (
          <View className="flex-row flex-wrap gap-2 mb-6">
            {property.features.map((feature) => (
              <View key={feature.id} className="bg-darkBlue px-3 py-1 rounded-lg">
                <Text className="text-white text-xs">{feature.name}</Text>
              </View>
            ))}
          </View>
        )}

        {property.latitude && property.longitude && (
          <MapPreview
            initialLatitude={Number(property.latitude)}
            initialLongitude={Number(property.longitude)}
            showMarker={true}
            move={true}
            title={'Address'}
            description={`${property.street}, ${property.locality}`}
            onPress={() => {}}
          />
        )}

        <TouchableOpacity className="bg-[#353949] rounded-xl p-4 items-center">
          <Text className="text-white text-base font-medium">Contact Owner</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

export default PropertyView
