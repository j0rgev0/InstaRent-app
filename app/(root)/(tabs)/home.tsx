import { useFocusEffect } from 'expo-router'
import React, { useCallback, useState } from 'react'
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
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

const { height, width } = Dimensions.get('window')

const HomePage = () => {
  const [properties, setProperties] = useState<Property[]>([])
  const [expandedDescriptions, setExpandedDescriptions] = useState<string[]>([])

  // Filtros
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

      setProperties(data)
    } catch (error) {
      console.error('Error getting properties', error)
    }
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
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      {/* Botón para mostrar/ocultar filtros */}
      <View style={{ position: 'absolute', top: 40, left: 0, right: 0, zIndex: 20 }}>
        <TouchableOpacity onPress={() => setShowFilters(!showFilters)} className="bg-gray-800 py-2">
          <Text className="text-white font-bold text-center">
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Panel de filtros */}
      {showFilters && (
        <View
          className="bg-gray-900 px-4 pt-4 pb-6"
          style={{
            position: 'absolute',
            top: 80,
            left: 0,
            right: 0,
            zIndex: 10
          }}>
          <Text className="text-white mb-1">Operation</Text>
          <Picker
            selectedValue={filters.operation}
            onValueChange={(value: string) => setFilters((prev) => ({ ...prev, operation: value }))}
            style={{ color: 'white', backgroundColor: '#1f1f1f', marginBottom: 8 }}>
            <Picker.Item label="All" value="" />
            <Picker.Item label="Rent" value="rent" />
            <Picker.Item label="Sell" value="sell" />
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

      <FlatList
        contentContainerStyle={{ paddingTop: showFilters ? 300 : 0 }}
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
