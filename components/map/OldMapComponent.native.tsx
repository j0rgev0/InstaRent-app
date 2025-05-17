import * as Location from 'expo-location'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import {
  Dimensions,
  FlatList,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native'
import MapView, { Marker } from 'react-native-maps'

import { GOOGLE_MAPS_API_KEY } from '@/utils/constants'

import '@/global.css'
import { Ionicons } from '@expo/vector-icons'
import 'react-native-get-random-values'

const INITIAL_DELTA = { latitudeDelta: 0.005, longitudeDelta: 0.005 }

export default function MapComponent() {
  const params = useLocalSearchParams()
  const edit = params.edit === 'true' ? true : false
  const propertyid = params.propertyid

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

  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null)
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(
    null
  )
  const [address, setAddress] = useState<string | null>(null)
  const [locationConfirmed, setLocationConfirmed] = useState(false)

  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<any[]>([])

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
      setLocationConfirmed(false)
      mapRef.current?.animateToRegion({ ...newCoords, ...INITIAL_DELTA }, 1000)
      setQuery(description)
      setSuggestions([])
    } catch (err) {
      console.error('Error selecting place:', err)
    }
  }

  const confirmLocation = () => {
    if (!coords) return

    router.replace({
      pathname: '/(root)/(properties)/publish',
      params: {
        ...sharedParams,
        latitude: coords.latitude,
        longitude: coords.longitude,
        propertyid,
        edit: edit ? 'true' : 'false'
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

        <TouchableOpacity
          onPress={centerMap}
          className="absolute bottom-7 right-5 bg-white rounded-full p-2 shadow-md z-20">
          <Ionicons name="locate" size={24} color="#353949" />
        </TouchableOpacity>

        {userLocation && (
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{ ...userLocation, ...INITIAL_DELTA }}
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
