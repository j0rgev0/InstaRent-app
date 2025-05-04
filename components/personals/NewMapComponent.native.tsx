import * as Location from 'expo-location'

import React, { useEffect, useRef, useState } from 'react'

import { AppleMaps, GoogleMaps } from 'expo-maps'
import { router, useLocalSearchParams } from 'expo-router'
import {
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useBottomTabOverflow } from '../ui/TabBarBackground'

import { AppleMapsMapType } from 'expo-maps/build/apple/AppleMaps.types'
import { GoogleMapsMapType } from 'expo-maps/build/google/GoogleMaps.types'

import { GOOGLE_MAPS_API_KEY } from '@/utils/constants'

import '@/global.css'
import { Ionicons } from '@expo/vector-icons'
import 'react-native-get-random-values'

export default function MapComponent() {
  const ref = useRef<AppleMaps.MapView>(null)

  const bottom = useBottomTabOverflow()
  const [address, setAddress] = useState<string | null>(null)
  const [locationConfirmed, setLocationConfirmed] = useState(false)

  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<any[]>([])

  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null)
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(
    null
  )

  const [zoom, setZoom] = useState<number>(15)

  const params = useLocalSearchParams()
  const { operationTypes, description, housingTypes, bathrooms, bedrooms, price, size } = params

  const sharedParams = {
    operationTypes,
    housingTypes,
    description,
    bathrooms,
    bedrooms,
    price,
    size
  }

  const fetchAddress = async ({ latitude, longitude }: { latitude: number; longitude: number }) => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}&language=en`
      )
      const data = await res.json()
      setAddress(data.results?.[0]?.formatted_address || 'Address not found')
    } catch (e) {
      console.error('Error fetching address:', e)
      setAddress('Error fetching address')
    }
  }

  const confirmLocation = () => {
    if (!coords) return

    router.replace({
      pathname: '/(root)/(properties)/publish',
      params: {
        ...sharedParams,
        latitude: coords.latitude,
        longitude: coords.longitude
      }
    })
  }

  const cameraPositiom = {
    coordinates: {
      latitude: coords?.latitude,
      longitude: coords?.longitude
    },
    zoom
  }

  useEffect(() => {
    ;(async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') return alert('Location permission denied')

      const { coords } = await Location.getCurrentPositionAsync({})
      const userCoords = { latitude: coords.latitude, longitude: coords.longitude }

      setUserLocation(userCoords)
      setCoords(userCoords)
      fetchAddress(userCoords)

      setTimeout(() => {
        ref.current?.setCameraPosition({
          coordinates: {
            latitude: coords.latitude,
            longitude: coords.longitude
          },
          zoom: zoom
        })
      }, 1500)
    })()
  }, [])

  const handleSelect = async (placeId: string, description: string) => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_MAPS_API_KEY}&fields=geometry`
      )
      const json = await res.json()
      const { lat, lng } = json.result.geometry.location
      const newCoords = { latitude: lat, longitude: lng }

      setCoords(newCoords)
      fetchAddress(newCoords)
      setZoom(20)
      setLocationConfirmed(false)
      ref.current?.setCameraPosition({
        coordinates: {
          latitude: coords?.latitude,
          longitude: coords?.longitude
        },
        zoom: zoom
      })
      setQuery(description)
      setSuggestions([])
    } catch (err) {
      console.error('Error selecting place:', err)
    }
  }

  const fetchSuggestions = async (text: string) => {
    setQuery(text)
    if (text.length < 3) return setSuggestions([])

    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&key=${GOOGLE_MAPS_API_KEY}&language=en`
    try {
      const res = await fetch(url)
      const json = await res.json()
      setSuggestions(json.predictions || [])
    } catch (err) {
      console.error('Error fetching suggestions:', err)
      setSuggestions([])
    }
  }

  const markerApple = [
    {
      coordinates: { latitude: coords?.latitude, longitude: coords?.longitude },
      title: address || '',
      tintColor: 'red',
      systemImage: 'cup.and.saucer.fill'
    },
    {
      coordinates: { latitude: userLocation?.latitude, longitude: userLocation?.longitude },
      title: 'Your Location',
      tintColor: 'blue',
      systemImage: 'cup.and.saucer.fill'
    }
  ]

  const markerAndroid = [
    {
      coordinates: { latitude: coords?.latitude, longitude: coords?.longitude },
      title: 'Selected Location',
      snippet: address || '',
      draggable: true
    },
    {
      coordinates: { latitude: userLocation?.latitude, longitude: userLocation?.longitude },
      title: 'Your Location',
      snippet: address || '',
      color: 'blue',
      draggable: true
    }
  ]

  const centerMap = () => {
    if (!userLocation) return alert('User location not available.')

    setZoom(18)

    ref.current?.setCameraPosition({
      coordinates: {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude
      },
      zoom: zoom
    })
  }

  const renterCenterButton = () => (
    <>
      <TouchableOpacity
        onPress={centerMap}
        className="absolute bottom-7 right-5 bg-white rounded-full z-20"
        style={[styles.shadow, { padding: 10 }]}>
        <Ionicons name="locate" size={24} color="#353949" />
      </TouchableOpacity>
    </>
  )

  const renderConfirmView = () => (
    <>
      <View className="absolute bottom-20 left-5 right-5 bg-white rounded-2xl p-4 shadow-lg items-center justify-center z-30">
        <Text className="text-base text-neutral-800 mb-3 font-medium text-center">
          Confirm this location?{'\n'}
          {address ?? 'Loading address...'}
        </Text>
        <TouchableOpacity className="bg-[#353949] px-6 py-2 rounded-lg" onPress={confirmLocation}>
          <Text className="text-white text-base font-semibold">Confirm</Text>
        </TouchableOpacity>
      </View>
    </>
  )

  const renderPlacesAutocomplete = () => (
    <>
      <View style={styles.autocompleteContainer}>
        <TextInput
          placeholder="Search location"
          value={query}
          onChangeText={fetchSuggestions}
          style={styles.textInput}
        />
        {suggestions.length > 0 && (
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.place_id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => handleSelect(item.place_id, item.description)}>
                <Text>{item.description}</Text>
              </TouchableOpacity>
            )}
            style={styles.suggestionsList}
          />
        )}
      </View>
    </>
  )

  if (Platform.OS === 'ios') {
    return (
      <>
        <AppleMaps.View
          ref={ref}
          style={StyleSheet.absoluteFill}
          cameraPosition={cameraPositiom}
          markers={markerApple}
          properties={{
            isTrafficEnabled: false,
            mapType: AppleMapsMapType.STANDARD,
            selectionEnabled: true
          }}
        />

        <SafeAreaView style={{ flex: 1, paddingBottom: bottom }} pointerEvents="box-none">
          {renderPlacesAutocomplete()}
          {renderConfirmView()}
          {renterCenterButton()}
        </SafeAreaView>
      </>
    )
  } else if (Platform.OS === 'android') {
    return (
      <>
        <GoogleMaps.View
          ref={ref}
          style={StyleSheet.absoluteFill}
          cameraPosition={cameraPositiom}
          markers={markerAndroid}
          properties={{
            isBuildingEnabled: true,
            isIndoorEnabled: true,
            mapType: GoogleMapsMapType.NORMAL,
            selectionEnabled: true,
            isTrafficEnabled: true
          }}
        />

        <SafeAreaView style={{ flex: 1, paddingBottom: bottom }} pointerEvents="box-none">
          {renderPlacesAutocomplete()}
          {renderConfirmView()}
          {renterCenterButton()}
        </SafeAreaView>
      </>
    )
  } else {
    return <Text>Maps are only available on Android and iOS</Text>
  }
}

const styles = StyleSheet.create({
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 4
  },
  autocompleteContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    zIndex: 1000
  },
  textInput: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    elevation: 5
  },
  suggestionsList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 8,
    elevation: 5,
    maxHeight: 150
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#eee'
  }
})
