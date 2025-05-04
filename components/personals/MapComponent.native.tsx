import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  Dimensions,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import { router, useLocalSearchParams } from 'expo-router'
import MapView, { Marker } from 'react-native-maps'

import * as Location from 'expo-location'

import { GOOGLE_MAPS_API_KEY } from '@/utils/constants'

import 'react-native-get-random-values'
import '@/global.css'

const INITIAL_DELTA = { latitudeDelta: 0.005, longitudeDelta: 0.005 }

export default function MapComponent() {
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

  const mapRef = useRef<MapView>(null)
  const autoCompleteRef = useRef<any>(null)

  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null)
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(
    null
  )
  const [address, setAddress] = useState<string | null>(null)
  const [locationConfirmed, setLocationConfirmed] = useState(false)

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
    autoCompleteRef.current?.blur()
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

  const centerMap = () => {
    if (!userLocation) return alert('User location not available.')

    mapRef.current?.animateToRegion({ ...userLocation, ...INITIAL_DELTA }, 1000)
  }

  if (Platform.OS === 'web') {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>The map is not available on the web version.</Text>
      </View>
    )
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="flex-1">
        <GooglePlacesAutocomplete
          ref={autoCompleteRef}
          placeholder="Search location"
          fetchDetails
          debounce={200}
          enablePoweredByContainer={false}
          onPress={handlePlaceSelect}
          query={{ key: GOOGLE_MAPS_API_KEY, language: 'en' }}
          GooglePlacesDetailsQuery={{ fields: 'geometry' }}
          styles={autocompleteStyles}
        />

        <TouchableOpacity
          onPress={centerMap}
          className="absolute bottom-10 right-5 bg-white rounded-full z-20"
          style={[styles.shadow, { padding: 12 }]}></TouchableOpacity>

        {userLocation && (
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{ ...userLocation, latitudeDelta: 0.002, longitudeDelta: 0.002 }}
            showsUserLocation
            showsMyLocationButton
            showsBuildings
            showsCompass>
            {coords && (
              <Marker coordinate={coords} title="Location" description="Selected location" />
            )}
            <Marker
              coordinate={userLocation}
              title="Your location"
              description="User's current location"
              pinColor="blue"
            />
          </MapView>
        )}

        {coords && !locationConfirmed && (
          <View className="absolute bottom-20 left-5 right-5 bg-white rounded-2xl p-4 shadow-lg items-center justify-center z-30">
            <Text className="text-base text-neutral-800 mb-3 font-medium text-center">
              Confirm this location?{'\n'}
              {address ?? 'Loading address...'}
            </Text>
            <TouchableOpacity
              className="bg-[#353949] px-6 py-2 rounded-lg"
              onPress={confirmLocation}>
              <Text className="text-white text-base font-semibold">Confirm</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  )
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
  }
})

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
