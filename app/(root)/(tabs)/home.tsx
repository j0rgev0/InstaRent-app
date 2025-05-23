import { useFocusEffect } from 'expo-router'
import React, { useCallback, useState } from 'react'
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'

import { INSTARENT_API_KEY, INSTARENT_API_URL } from '@/utils/constants'
import { Property } from '@/utils/types'
import Ionicons from '@expo/vector-icons/build/Ionicons'
import { Picker } from '@react-native-picker/picker'

import '@/global.css'

const { height, width } = Dimensions.get('window')

const HomePage = () => {
  const [properties, setProperties] = useState<Property[]>([])
  const [expandedDescriptions, setExpandedDescriptions] = useState<string[]>([])

  const [refreshing, setRefreshing] = useState(false)

  const [filters, setFilters] = useState({
    operation: '',
    type: '',
    locality: ''
  })

  const [showFilters, setShowFilters] = useState(false)

  const fetchProperties = async () => {
    try {
      const queryParams = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '') queryParams.append(key, value)
      })

      const url = `${INSTARENT_API_URL}/properties?${queryParams.toString()}`

      const response = await fetch(url, {
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

      // Asegurar que data sea un array
      setProperties(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error getting properties', error)
      setProperties([]) // Limpiar propiedades para evitar estado inconsistente
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchProperties()
    setRefreshing(false)
  }

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('light-content', true)
      if (Platform.OS === 'web') document.title = 'Home'
      fetchProperties()
    }, [filters])
  )

  const toggleDescription = (id: string) => {
    setExpandedDescriptions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  return (
    <View className={`flex-1 bg-black ${refreshing ? 'pt-10' : ''}`}>
      <View style={{ position: 'absolute', top: 55, left: 0, zIndex: 20 }}>
        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          className="bg-white/60 px-4 py-2 rounded-2xl flex-row items-center space-x-2 self-start mx-2 shadow-sm">
          <Text className="text-white text-lg font-semibold">
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Text>
          <Ionicons name={showFilters ? 'chevron-up' : 'chevron-down'} size={20} color="white" />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View
          className="bg-gray-900 px-4 pt-4 pb-6"
          style={{
            position: 'absolute',
            top: 100,
            left: 0,
            right: 0,
            zIndex: 10
          }}>
          <Text className="text-white mb-1">Operation</Text>
          <Picker
            selectedValue={filters.operation}
            onValueChange={(value: string) => setFilters((prev) => ({ ...prev, operation: value }))}
            className="bg-neutral-900"
            style={{ color: 'white' }}>
            <Picker.Item
              color={Platform.OS === 'android' ? 'black' : 'white'}
              label="All"
              value=""
            />
            <Picker.Item
              color={Platform.OS === 'android' ? 'black' : 'white'}
              label="Rent"
              value="rent"
            />
            <Picker.Item
              color={Platform.OS === 'android' ? 'black' : 'white'}
              label="Sell"
              value="sell"
            />
          </Picker>

          <Text className="text-white mb-1">Type</Text>
          <TextInput
            placeholder="e.g. apartment, house"
            placeholderTextColor="#aaa"
            value={filters.type}
            onChangeText={(text) => setFilters((prev) => ({ ...prev, type: text }))}
            className="text-white border border-gray-700 p-2 rounded mb-2"
          />

          <Text className="text-white mb-1">Locality</Text>
          <TextInput
            placeholder="e.g. Madrid, Barcelona"
            placeholderTextColor="#aaa"
            value={filters.locality}
            onChangeText={(text) => setFilters((prev) => ({ ...prev, locality: text }))}
            className="text-white border border-gray-700 p-2 rounded mb-4"
          />

          <TouchableOpacity onPress={fetchProperties} className="bg-blue-600 p-3 rounded">
            <Text className="text-white text-center font-bold">Apply Filters</Text>
          </TouchableOpacity>
        </View>
      )}

      {properties.length === 0 && !refreshing && (
        <View className="flex-1 justify-center items-center">
          <Text className="text-white text-xl">No properties found with current filters.</Text>
        </View>
      )}

      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FFFFFF']}
            tintColor="#FFFFFF"
          />
        }
        renderItem={({ item }) => {
          const isExpanded = expandedDescriptions.includes(item.id)
          const maxLength = 70
          const description = item.description

          // Validar que haya imágenes para evitar errores
          const imageUrl = item.images && item.images.length > 0 ? item.images[0].url : null

          return (
            <View style={{ height }}>
              <View className="h-full w-full bg-black justify-end">
                {imageUrl ? (
                  <Image
                    source={{ uri: imageUrl }}
                    style={{ height, width }}
                    className="absolute"
                    resizeMode="contain"
                  />
                ) : (
                  <View
                    style={{ height, width }}
                    className="absolute bg-gray-800 justify-center items-center">
                    <Text className="text-gray-400">No Image</Text>
                  </View>
                )}

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
                        €{item.price.toLocaleString()}
                        {item.operation === 'sell' ? '' : ' / month'}
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
    </View>
  )
}

export default HomePage
