import * as Location from 'expo-location'

import React, { useEffect, useRef, useState } from 'react'

import { AppleMaps, GoogleMaps } from 'expo-maps'
import { router, useLocalSearchParams } from 'expo-router'
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useBottomTabOverflow } from '../ui/TabBarBackground'

import { GOOGLE_MAPS_API_KEY } from '@/utils/constants'

import '@/global.css'
import 'react-native-get-random-values'

const INITIAL_DELTA = { latitudeDelta: 0.005, longitudeDelta: 0.005 }

export default function MapComponent() {
  const mapRef = useRef<any>(null)
  const autoCompleteRef = useRef<any>(null)

  const bottom = useBottomTabOverflow()
  const [address, setAddress] = useState<string | null>(null)
  const [locationConfirmed, setLocationConfirmed] = useState(false)

  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null)
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(
    null
  )

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

  const handlePlaceSelect = async (data: any, details: any) => {
    if (!details) return

    const { lat, lng } = details.geometry.location
    const newCoords = { latitude: lat, longitude: lng }

    setCoords(newCoords)
    fetchAddress(newCoords)
    setLocationConfirmed(false)
    mapRef.current?.animateToRegion({ ...newCoords, ...INITIAL_DELTA }, 1000)
    if (autoCompleteRef.current) {
      autoCompleteRef.current.blur()
    }
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
        mapRef.current?.animateToRegion({ ...userCoords, ...INITIAL_DELTA }, 1000)
      }, 500)
    })()
  }, [])

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
      latitude: 40.111706595275386,
      longitude: -3.6335869290179206
    },
    zoom: 10
  }

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
      <GooglePlacesAutocomplete
        ref={autoCompleteRef}
        placeholder="Search location"
        filterReverseGeocodingByTypes={['locality', 'sublocality']}
        fetchDetails
        debounce={200}
        enablePoweredByContainer={false}
        onPress={handlePlaceSelect}
        query={{ key: GOOGLE_MAPS_API_KEY, language: 'en' }}
        GooglePlacesDetailsQuery={{ fields: 'geometry' }}
        styles={autocompleteStyles}
      />
    </>
  )

  if (Platform.OS === 'ios') {
    return (
      <>
        <AppleMaps.View style={StyleSheet.absoluteFill} cameraPosition={cameraPositiom} />

        <SafeAreaView style={{ flex: 1, paddingBottom: bottom }} pointerEvents="box-none">
          {renderPlacesAutocomplete()}
          {renderConfirmView()}
        </SafeAreaView>
      </>
    )
  } else if (Platform.OS === 'android') {
    return (
      <>
        <GoogleMaps.View style={StyleSheet.absoluteFill} cameraPosition={cameraPositiom} />
        <SafeAreaView style={{ flex: 1, paddingBottom: bottom }} pointerEvents="box-none">
          {renderPlacesAutocomplete()}
          {renderConfirmView()}
        </SafeAreaView>
      </>
    )
  } else {
    return <Text>Maps are only available on Android and iOS</Text>
  }
}

const autocompleteStyles = {
  container: {
    position: 'absolute',
    top: 20,
    width: '90%',
    alignSelf: 'center',
    zIndex: 999
  },
  textInput: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    elevation: 5
  },
  listView: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 8,
    elevation: 5
  }
}
