import React, { useCallback, useRef, useState } from 'react'
import {
  Dimensions,
  FlatList,
  Platform,
  RefreshControl,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

import * as Location from 'expo-location'
import { router, useFocusEffect } from 'expo-router'

import Ionicons from '@expo/vector-icons/build/Ionicons'

import { GOOGLE_MAPS_API_KEY, INSTARENT_API_KEY, INSTARENT_API_URL } from '@/utils/constants'

import '@/global.css'

import GeneralFilters from '@/components/home/GeneralFilters'
import LocationFilters from '@/components/home/LocationFilters'
import PropertyCard from '@/components/home/PropertyCard'
import { fetchWithErrorHandling, handleNetworkError } from '@/utils/error-handler'

const { height } = Dimensions.get('window')

interface PropertyImage {
  id: string
  url: string
}

interface Property {
  id: string
  title: string
  description: string
  price: number
  operation: 'rent' | 'sell'
  type: string
  features: string[]
  images: PropertyImage[]
  street: string
  street_number: string
  locality: string
  size: number
}

const HomePage = () => {
  const [properties, setProperties] = useState<Property[]>([])
  const [expandedDescriptions, setExpandedDescriptions] = useState<string[]>([])
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(
    null
  )
  const [currentAddress, setCurrentAddress] = useState<string>('')
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const lastGeocodeTime = useRef<number>(0)
  const GEOCODE_COOLDOWN = 2000
  const lastNavigationTime = useRef<number>(0)
  const NAVIGATION_COOLDOWN = 1000

  const [refreshing, setRefreshing] = useState(false)

  const [filters, setFilters] = useState({
    operation: '',
    type: [] as string[],
    features: [] as string[],
    province: [] as string[],
    country: [] as string[],
    locality: '',
    minSize: '',
    maxSize: '',
    minPrice: '',
    maxPrice: ''
  })

  const [showFilters, setShowFilters] = useState(false)
  const [showLocationFilters, setShowLocationFilters] = useState(false)

  const [priceRange, setPriceRange] = useState({
    min: 0,
    max: 9999999
  })

  const MAX_DISPLAY_LENGTH = 30

  const fetchProperties = async () => {
    try {
      const queryParams = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => queryParams.append(key, v))
        } else if (value !== '') {
          if (key === 'minSize' || key === 'maxSize') {
            queryParams.append(key, value)
          } else {
            queryParams.append(key, value)
          }
        }
      })

      const url = `${INSTARENT_API_URL}/properties?${queryParams.toString()}`

      const response = await fetchWithErrorHandling(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${INSTARENT_API_KEY}`
        }
      })

      const data = await response.json()
      setProperties(Array.isArray(data) ? data : [])
    } catch (error) {
      handleNetworkError(error, 'Error getting properties')
      setProperties([])
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchProperties()
    setRefreshing(false)
  }

  const handleApplyFilters = () => {
    fetchProperties().then(() => {
      setShowFilters(false)
      setShowLocationFilters(false)
    })
  }

  const clearGeneralFilters = () => {
    setFilters((prev) => ({
      ...prev,
      operation: '',
      type: [],
      features: [],
      minSize: '',
      maxSize: '',
      minPrice: '',
      maxPrice: ''
    }))
    setPriceRange({
      min: 0,
      max: 9999999
    })
    fetchProperties()
  }

  const clearLocationFilters = () => {
    setFilters((prev) => ({
      ...prev,
      province: [],
      country: [],
      locality: ''
    }))
    setCurrentAddress('')
    fetchProperties()
  }

  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true)
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        console.log('Permission to access location was denied')
        return
      }

      const location = await Location.getCurrentPositionAsync({})
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      })

      const now = Date.now()
      if (now - lastGeocodeTime.current < GEOCODE_COOLDOWN) {
        console.log('Skipping geocode due to rate limit')
        return
      }

      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.coords.latitude},${location.coords.longitude}&key=${GOOGLE_MAPS_API_KEY}&language=en`
        )
        const data = await response.json()

        if (data.results && data.results.length > 0) {
          const result = data.results[0]
          let province = ''
          let country = ''

          for (const component of result.address_components) {
            if (component.types.includes('administrative_area_level_2')) {
              province = component.long_name.toLowerCase()
            }
            if (component.types.includes('country')) {
              country = component.long_name.toLowerCase()
            }
          }

          if (province) {
            setCurrentAddress(province)
            setFilters((prev) => ({
              ...prev,
              province: [province],
              country: country ? [country] : prev.country
            }))
          } else if (country) {
            setCurrentAddress(country)
            setFilters((prev) => ({
              ...prev,
              province: [],
              country: [country]
            }))
          } else {
            setCurrentAddress('Location not found')
          }
          lastGeocodeTime.current = now
        } else {
          setCurrentAddress('Location not found')
        }
      } catch (geocodeError) {
        console.log('Geocoding error:', geocodeError)
        setCurrentAddress('Current Location')
      }
    } catch (error) {
      console.error('Error getting location:', error)
    } finally {
      setIsLoadingLocation(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('light-content', true)
      if (Platform.OS === 'web') document.title = 'Home'

      if (!userLocation) {
        getCurrentLocation()
      }
      fetchProperties()
    }, [filters])
  )

  const toggleDescription = (id: string) => {
    setExpandedDescriptions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  React.useEffect(() => {
    const maxPrice = filters.operation === 'rent' ? 10000 : 9999999
    setPriceRange((prev) => ({
      min: Math.min(prev.min, maxPrice),
      max: Math.min(prev.max, maxPrice)
    }))
  }, [filters.operation])

  const handleViewProperty = (propertyId: string) => {
    const now = Date.now()
    if (now - lastNavigationTime.current < NAVIGATION_COOLDOWN) {
      return
    }
    lastNavigationTime.current = now

    router.push({
      pathname: '/(root)/(properties)/propertyView',
      params: {
        propertyId,
        fromHome: 'true'
      }
    })
  }

  const renderItem = useCallback(
    ({ item }: { item: Property }) => {
      const isExpanded = expandedDescriptions.includes(item.id)
      return (
        <PropertyCard
          item={item}
          isExpanded={isExpanded}
          onToggleDescription={() => toggleDescription(item.id)}
          onViewProperty={() => handleViewProperty(item.id)}
        />
      )
    },
    [expandedDescriptions]
  )

  return (
    <View className={`flex-1 bg-black ${refreshing ? 'pt-10' : ''}`}>
      <View style={{ position: 'absolute', top: 45, left: 0, zIndex: 20 }}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            setShowFilters(!showFilters)
            if (!showFilters) setShowLocationFilters(false)
          }}
          className="px-4 py-2 rounded-2xl flex-row items-center space-x-2 self-start mx-2 shadow-sm">
          <Text className="text-white text-2xl font-bold">
            {showFilters ? 'Filters' : 'Filters'}
          </Text>
          <Ionicons name={showFilters ? 'chevron-up' : 'chevron-down'} size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View style={{ position: 'absolute', top: 45, right: 10, zIndex: 20 }}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            setShowLocationFilters(!showLocationFilters)
            if (!showLocationFilters) setShowFilters(false)
          }}
          className="px-3 py-2 rounded-2xl flex-row items-center space-x-2 bg-white/80">
          <Ionicons name="location-sharp" size={20} color="black" />
          <Text className="text-black text-base capitalize">
            {currentAddress ||
              (filters.country.length > 0
                ? (() => {
                    const countries = filters.country.map(
                      (c) => c.charAt(0).toUpperCase() + c.slice(1)
                    )
                    let displayText = countries.join(', ')
                    if (displayText.length > MAX_DISPLAY_LENGTH) {
                      displayText = displayText.substring(0, MAX_DISPLAY_LENGTH) + '...'
                    }
                    return displayText
                  })()
                : 'No location selected')}
          </Text>
        </TouchableOpacity>
      </View>

      {showLocationFilters && (
        <LocationFilters
          filters={filters}
          setFilters={setFilters}
          currentAddress={currentAddress}
          setCurrentAddress={setCurrentAddress}
          isLoadingLocation={isLoadingLocation}
          getCurrentLocation={getCurrentLocation}
          handleApplyFilters={handleApplyFilters}
          clearLocationFilters={clearLocationFilters}
        />
      )}

      {showFilters && (
        <GeneralFilters
          filters={filters}
          setFilters={setFilters}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          handleApplyFilters={handleApplyFilters}
          clearGeneralFilters={clearGeneralFilters}
        />
      )}

      {properties.length === 0 && !refreshing && (
        <View className="flex-1 justify-center items-center">
          <Text className="text-white text-xl">No properties found with current filters.</Text>
        </View>
      )}

      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FFFFFF']}
            tintColor="#FFFFFF"
          />
        }
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        decelerationRate="fast"
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        windowSize={3}
        initialNumToRender={2}
      />
    </View>
  )
}

export default React.memo(HomePage)
