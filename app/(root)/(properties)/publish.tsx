import React, { useCallback, useState } from 'react'

import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'

import { GOOGLE_MAPS_API_KEY } from '@/utils/constants'

import AddressAutocomplete from '@/components/personals/MapComponent.web'
// @ts-ignore
import MapPreview from '@/components/personals/MapPreview'

import Counter from '@/components/personals/Counter'
import { Ionicons } from '@expo/vector-icons'

import '@/global.css'

const PublishPage = () => {
  const [showMarker, setShowMarker] = useState(false)
  const [hasDoorNumber, setHasDoorNumber] = useState(false)
  const [hasContructionYear, sethasContructionYear] = useState(false)

  const params = useLocalSearchParams()

  const initialBathrooms = params.bathrooms ? Number(params.bathrooms) : 1
  const initialBedrooms = params.bedrooms ? Number(params.bedrooms) : 1
  const initialSize = params.size ? Number(params.size) : null
  const initialPrice = params.price ? Number(params.price) : null

  const housingTypes = params.housingTypes ?? 'apartment'
  const operationTypes = params.operationTypes ?? 'rent'
  const [size, setSize] = useState<number | null>(initialSize)
  const [price, setPrice] = useState<number | null>(initialPrice)
  const [bathrooms, setBathrooms] = useState(initialBathrooms)
  const [bedrooms, setBedrooms] = useState(initialBedrooms)
  const conservation = params.conservation
  const latitude = params.latitude
  const longitude = params.longitude
  const [doorNumber, setDoorNumber] = useState<number | null>(null)
  const [doorLetter, setDoorLetter] = useState<string | undefined>(undefined)
  const [constructionYear, setConstructionYear] = useState<string>('')
  const [description, setDescription] = useState<string | undefined>(
    params.description ? String(params.description) : undefined
  )
  const [addressComponents, setAddressComponents] = useState({
    street: '',
    streetNumber: '',
    neighborhood: '',
    locality: '',
    province: '',
    state: '',
    country: '',
    postalCode: '',
    formattedAddress: ''
  })

  const [markerCoords, setMarkerCoords] = useState({
    latitude: Number(latitude) || 40.4168,
    longitude: Number(longitude) || -3.7038
  })

  const conservationValue =
    typeof conservation === 'string' ? conservation : conservation?.[0] || ''

  const housingTypeValue = typeof housingTypes === 'string' ? housingTypes : housingTypes?.[0] || ''

  const conservationLabelMap: Record<string, string> = {
    to_renovate: 'To renovate'
  }
  const typeLabelMap: Record<string, string> = {
    ruralproperty: 'Rural Property',
    groundfloor: 'Ground Floor'
  }

  const fetchAddressFromCoords = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}&language=en`
      )
      const data = await response.json()
      console.log(JSON.stringify(data.results[0].address_components, null, 2))
      if (data.results.length > 0) {
        const result = data.results[0]

        const components = {
          street: '',
          streetNumber: '',
          neighborhood: '',
          locality: '',
          province: '',
          state: '',
          country: '',
          postalCode: '',
          formattedAddress: result.formatted_address
        }

        let foundCity = false

        result.address_components.forEach((component: any) => {
          const types = component.types
          const name = component.long_name

          if (types.includes('street_number')) {
            components.streetNumber = name
          }

          if (types.includes('route')) {
            components.street = name
          }

          if (types.includes('sublocality') || types.includes('neighborhood')) {
            components.neighborhood = name
          }

          if (types.includes('locality') && !foundCity) {
            components.locality = name
            foundCity = true
          }

          if (types.includes('administrative_area_level_2')) {
            components.province = name
            if (!foundCity) {
              components.locality = name
            }
          }

          if (types.includes('administrative_area_level_1')) {
            components.state = name
          }

          if (types.includes('country')) {
            components.country = name
          }

          if (types.includes('postal_code')) {
            components.postalCode = name
          }
        })

        setAddressComponents(components)
        console.log('Address Components:', JSON.stringify(components, null, 2))
      } else {
        setAddressComponents({
          street: '',
          streetNumber: '',
          neighborhood: '',
          locality: '',
          province: '',
          state: '',
          country: '',
          postalCode: '',
          formattedAddress: ''
        })
      }
    } catch (error) {
      console.error('Error fetching address:', error)

      setAddressComponents({
        street: '',
        streetNumber: '',
        neighborhood: '',
        locality: '',
        province: '',
        state: '',
        country: '',
        postalCode: '',
        formattedAddress: ''
      })
    }
  }

  const handleMarkerDragEnd = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate
    setMarkerCoords({ latitude, longitude })
    setShowMarker(true)
    fetchAddressFromCoords(latitude, longitude)
  }

  const handleNumericInput = (text: string, setter: (val: number | null) => void, max: number) => {
    const numericText = text.replace(/[^0-9]/g, '')
    if (numericText === '') {
      setter(null)
    } else {
      const value = Number(numericText)
      if (value <= max) setter(value)
    }
  }

  useFocusEffect(
    useCallback(() => {
      if (latitude && longitude) {
        const parsedLat = Number(latitude)
        const parsedLng = Number(longitude)

        const hasCustomCoordinates =
          parsedLat !== 0 && parsedLng !== 0 && (parsedLat !== 40.4168 || parsedLng !== -3.7038)

        if (hasCustomCoordinates) {
          const handleAsyncTasks = async () => {
            try {
              await handleMarkerDragEnd({
                nativeEvent: {
                  coordinate: {
                    latitude: parsedLat,
                    longitude: parsedLng
                  }
                }
              })
            } catch (error) {
              console.error('Error handling marker drag:', error)
            }
          }

          handleAsyncTasks()
        }
      }
    }, [latitude, longitude])
  )

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView className="space-y-4 px-4 py-6">
        <View className="border-b border-gray-300 mb-5">
          <TouchableOpacity
            className="h-16 flex-1 border border-gray-400 justify-center rounded-xl p-4 mb-4"
            onPress={() =>
              router.replace({
                pathname: '/(root)/(properties)/selectType',
                params: {
                  operationTypes,
                  housingTypes,
                  conservation,
                  description,
                  bathrooms,
                  longitude: markerCoords.longitude,
                  latitude: markerCoords.latitude,
                  bedrooms,
                  price,
                  size
                }
              })
            }>
            <Text className="text-sm text-gray-400">Type of housing</Text>
            <Text className="text-base text-black capitalize">
              {typeLabelMap[housingTypeValue] || housingTypeValue}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="h-16 flex-1 border border-gray-400 justify-center rounded-xl p-4 mb-4"
            onPress={() =>
              router.replace({
                pathname: '/(root)/(properties)/operationType',
                params: {
                  operationTypes,
                  housingTypes,
                  conservation,
                  description,
                  bathrooms,
                  longitude: markerCoords.longitude,
                  latitude: markerCoords.latitude,
                  bedrooms,
                  price,
                  size
                }
              })
            }>
            <Text className="text-sm text-gray-400">Operation type</Text>
            <Text className="text-base text-black capitalize">{operationTypes}</Text>
          </TouchableOpacity>
        </View>
        <View className="border-b border-gray-300 mb-5">
          <Text className="text-xl text-darkBlue font-bold mb-4">Details</Text>

          <View className="flex-row items-center rounded-xl border border-gray-400 h-14 px-4 mb-4">
            <TextInput
              keyboardType="numeric"
              className="flex-1 text-lg h-full"
              placeholder="Size"
              placeholderTextColor="gray"
              value={size !== null ? size.toString() : ''}
              onChangeText={(text) => handleNumericInput(text, setSize, 99999)}
            />
            <Text className="text-lg ml-2">m²</Text>
          </View>

          <View className="flex-row items-center rounded-xl border border-gray-400 h-14 px-4 mb-4">
            <TextInput
              keyboardType="numeric"
              className="flex-1 text-lg h-full"
              placeholder={operationTypes === 'sell' ? 'Selling price' : 'Rent price'}
              placeholderTextColor="gray"
              value={price !== null ? price.toString() : ''}
              onChangeText={(text) =>
                handleNumericInput(text, setPrice, operationTypes === 'rent' ? 999999 : 999999999)
              }
            />
            <Text className="text-lg ml-2">{operationTypes === 'sell' ? '€' : '€/month'}</Text>
          </View>

          <Counter label="Bedrooms:" value={bedrooms} setValue={setBedrooms} min={1} max={10} />
          <Counter label="Bathrooms:" value={bathrooms} setValue={setBathrooms} min={1} max={10} />

          <TouchableOpacity
            className="h-16 flex-1 border border-gray-400 justify-center rounded-xl p-4 mb-4"
            onPress={() =>
              router.replace({
                pathname: '/(root)/(properties)/conservation',
                params: {
                  operationTypes,
                  housingTypes,
                  conservation,
                  description,
                  bathrooms,
                  longitude: markerCoords.longitude,
                  latitude: markerCoords.latitude,
                  bedrooms,
                  price,
                  size
                }
              })
            }>
            <Text className="text-sm text-gray-400">Conservation</Text>
            <Text className="text-base text-black capitalize">
              {!conservation
                ? 'Select'
                : conservationLabelMap[conservationValue] || conservationValue}
            </Text>
          </TouchableOpacity>
        </View>
        <View className="border-b border-gray-300 mb-5">
          <Text className="text-xl text-darkBlue font-bold mb-4">Location</Text>

          <Text className="text-lg mb-4">
            {addressComponents.formattedAddress
              ? addressComponents.formattedAddress
              : 'Select your address'}
          </Text>

          {Platform.OS === 'web' ? (
            <AddressAutocomplete
              onPlaceSelected={(place) => {
                if (!place.geometry || !place.geometry.location) {
                  console.warn('La ubicación no está disponible para este lugar.')
                  return
                }

                const lat = place.geometry.location.lat?.()
                const lng = place.geometry.location.lng?.()

                if (lat !== undefined && lng !== undefined) {
                  setMarkerCoords({ latitude: lat, longitude: lng })
                  setShowMarker(true)
                  console.log('Coordenadas:', { lat, lng })
                  fetchAddressFromCoords(lat, lng)
                } else {
                  console.warn('No se pudieron obtener lat/lng.')
                }
              }}
            />
          ) : (
            <MapPreview
              initialLatitude={Number(latitude) || 40.4168}
              initialLongitude={Number(longitude) || -3.7038}
              showMarker={showMarker}
              onPress={() =>
                router.replace({
                  pathname: '/(root)/(properties)/maps',
                  params: {
                    operationTypes,
                    housingTypes,
                    description,
                    bathrooms,
                    longitude: markerCoords.longitude,
                    latitude: markerCoords.latitude,
                    bedrooms,
                    price,
                    size
                  }
                })
              }
            />
          )}
        </View>
        {housingTypes === 'apartment' ||
        housingTypes === 'penthouse' ||
        housingTypes === 'duplex' ||
        housingTypes === 'studio' ||
        housingTypes === 'loft' ? (
          <View className="border-b border-gray-300 mb-5">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg">Has door number?</Text>
              <Switch
                value={hasDoorNumber}
                onValueChange={setHasDoorNumber}
                trackColor={{ false: '#ccc', true: '#353949' }}
                thumbColor="#fff"
              />
            </View>

            {hasDoorNumber && (
              <View>
                <Text className="text-sm text-gray-500 mb-1">Insert door number (ej: 2A)</Text>
                <View className="flex-row items-center rounded-xl border border-gray-400 h-14 px-4 mb-4">
                  <TextInput
                    keyboardType="numeric"
                    className="flex-1 text-lg h-full"
                    placeholder="Number"
                    placeholderTextColor="gray"
                    value={doorNumber !== null ? doorNumber.toString() : ''}
                    onChangeText={(text) => handleNumericInput(text, setDoorNumber, 99999)}
                  />

                  <TextInput
                    keyboardType="default"
                    className="border-l border-gray-400 pl-4 flex-1 text-lg h-full capitalize"
                    placeholder="Letter"
                    placeholderTextColor="gray"
                    maxLength={1}
                    autoCapitalize="characters"
                    value={doorLetter}
                    onChangeText={(text: string) => {
                      const letter = text.replace(/[^a-zA-Z]/g, '').toUpperCase()
                      setDoorLetter(letter)
                    }}
                  />
                </View>
              </View>
            )}
          </View>
        ) : null}

        <View className="border-b border-gray-300 mb-5">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg">Has construction date?</Text>
            <Switch
              value={hasContructionYear}
              onValueChange={sethasContructionYear}
              trackColor={{ false: '#ccc', true: '#353949' }}
              thumbColor="#fff"
            />
          </View>

          {hasContructionYear && (
            <View>
              <Text className="text-sm text-gray-500 mb-1">Insert construction year</Text>
              <View className="flex-row items-center rounded-xl border border-gray-400 h-14 px-4 mb-4">
                <TextInput
                  keyboardType="numeric"
                  className="flex-1 text-lg h-full"
                  placeholder="YYYY"
                  placeholderTextColor="gray"
                  maxLength={4}
                  value={constructionYear}
                  onChangeText={(text) => {
                    const year = text.replace(/[^0-9]/g, '')
                    if (year.length <= 4) {
                      setConstructionYear(year)
                    }
                  }}
                />
              </View>
            </View>
          )}
        </View>

        <View className="border-b border-gray-300 mb-5">
          <Text className="text-lg mb-2">Descripción</Text>
          <TextInput
            className="rounded-xl border border-gray-400 px-4 py-2 mb-4 text-base"
            placeholder="Highlight features not visible in photos, like natural light, floor level, and key details about the neighborhood (e.g. quiet street, nearby parks, shops, transport, etc.)."
            placeholderTextColor="gray"
            multiline={true}
            numberOfLines={6}
            value={description}
            onChangeText={setDescription}
          />
        </View>
      </ScrollView>

      <View className="bg-white border-t border-gray-200 px-4 py-3 pb-10">
        <View className="flex-row justify-between">
          <TouchableOpacity className="w-[48%] h-16 flex-row items-center justify-center rounded-xl bg-darkBlue p-4">
            <Ionicons name="pencil-outline" size={24} color="white" />
            <Text className="ml-2 text-base font-semibold text-white">Publish</Text>
          </TouchableOpacity>

          <TouchableOpacity className="w-[48%] h-16 flex-row items-center justify-center rounded-xl bg-darkBlue p-4">
            <Ionicons name="albums-outline" size={24} color="white" />
            <Text className="ml-2 text-base font-semibold text-white">My Properties</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

export default PublishPage
