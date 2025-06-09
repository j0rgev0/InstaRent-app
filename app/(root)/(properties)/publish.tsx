import * as Location from 'expo-location'
import React, { useCallback, useLayoutEffect, useState } from 'react'

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'

import { router, useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router'

import { GOOGLE_MAPS_API_KEY, INSTARENT_API_KEY, INSTARENT_API_URL } from '@/utils/constants'

import { authClient } from '@/lib/auth-client'

import Counter from '@/components/common/Counter'
import AddressAutocomplete from '@/components/map/MapComponent.web'
// @ts-ignore
import MapPreview from '@/components/map/MapPreview'

import '@/global.css'
import { fetchWithErrorHandling, handleNetworkError } from '@/utils/error-handler'
import { Ionicons } from '@expo/vector-icons'

const PublishPage = () => {
  const params = useLocalSearchParams()
  const navigation = useNavigation()

  const { data: session } = authClient.useSession()

  const [showMarker, setShowMarker] = useState(false)
  const [hasFloorNumber, setHasFloorNumber] = useState(false)
  const [hasContructionYear, setHasContructionYear] = useState(false)
  const [locationPermission, setLocationPermission] = useState<boolean>(false)

  const edit = params.edit === 'true' ? true : false
  const propertyid = params.propertyid

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
  const latitude = isNaN(Number(params.latitude)) ? null : Number(params.latitude)
  const longitude = isNaN(Number(params.longitude)) ? null : Number(params.longitude)
  const [floorNumber, setFloorNumber] = useState<number | null>(null)
  const [doorLetter, setDoorLetter] = useState<string | undefined>(undefined)
  const [constructionYear, setConstructionYear] = useState<string>('')
  const [constructionYearError, setConstructionYearError] = useState<string>('')
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

  const propertyPayload = {
    type: housingTypes,
    operation: operationTypes,
    bathrooms,
    bedrooms,
    size,
    price,
    latitude: String(markerCoords.latitude),
    longitude: String(markerCoords.longitude),
    street: addressComponents.street,
    street_number: String(addressComponents.streetNumber),
    neighborhood: addressComponents.neighborhood || '',
    locality: addressComponents.locality,
    province: addressComponents.province,
    state: addressComponents.state,
    country: addressComponents.country,
    postal_code: String(addressComponents.postalCode),
    floor: floorNumber ?? 0,
    letter: doorLetter,
    conservation,
    description,
    user_id: session?.user.id,
    construction_year: Number(constructionYear) ?? ''
  }

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
      const response = await fetchWithErrorHandling(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}&language=en`
      )
      const data = await response.json()

      if (data.results && data.results.length > 0) {
        const result = data.results[0]
        const addressComponents = result.address_components.reduce((acc: any, component: any) => {
          const type = component.types[0]
          acc[type] = component.long_name
          return acc
        }, {})

        setAddressComponents({
          street: addressComponents.route || '',
          streetNumber: addressComponents.street_number || '',
          neighborhood: addressComponents.sublocality_level_1 || '',
          locality: addressComponents.locality || '',
          province: addressComponents.administrative_area_level_2 || '',
          state: addressComponents.administrative_area_level_1 || '',
          country: addressComponents.country || '',
          postalCode: addressComponents.postal_code || '',
          formattedAddress: result.formatted_address
        })
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
      handleNetworkError(error, 'Error fetching address')
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

  async function createProperty(propertyData: any, token: string) {
    try {
      const response = await fetchWithErrorHandling(`${INSTARENT_API_URL}/properties/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(propertyData)
      })

      const data = await response.json()
      return data
    } catch (error) {
      handleNetworkError(error, 'Error publishing property')
      throw error
    }
  }

  async function editProperty(propertyData: any, token: string) {
    try {
      const response = await fetchWithErrorHandling(
        `${INSTARENT_API_URL}/properties/edit/${propertyid}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(propertyData)
        }
      )

      const data = await response.json()
      return data
    } catch (error) {
      handleNetworkError(error, 'Error editing property')
      throw error
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

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      setLocationPermission(status === 'granted')

      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please enable location services to continue.',
          [{ text: 'OK' }]
        )
        return
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      })

      const newCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      }

      setMarkerCoords(newCoords)
      setShowMarker(true)
      await fetchAddressFromCoords(newCoords.latitude, newCoords.longitude)
    } catch (error) {
      console.error('Error getting location:', error)
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please try again or select a location manually.',
        [{ text: 'OK' }]
      )
    }
  }

  useFocusEffect(
    useCallback(() => {
      const parent = navigation.getParent()
      if (parent) {
        parent.setOptions({ gestureEnabled: false })
      }

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

      return () => {
        if (parent) {
          parent.setOptions({ gestureEnabled: true })
        }
      }
    }, [latitude, longitude, navigation])
  )

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const validatePropertyData = () => {
    const errors: Record<string, string> = {}

    if (!size) errors.size = 'Size is required'
    if (!price) errors.price = 'Price is required'
    if (!addressComponents.street) errors.address = 'Address is required'
    if (!addressComponents.streetNumber) errors.address = 'Street number is required'
    if (!addressComponents.locality) errors.address = 'City is required'
    if (!addressComponents.country) errors.address = 'Country is required'
    if (!description) errors.description = 'Description is required'

    if (!markerCoords.latitude || !markerCoords.longitude) {
      errors.location = 'Please select a location'
    } else if (markerCoords.latitude === 40.4168 && markerCoords.longitude === -3.7038) {
      errors.location = 'Please select a valid location'
    } else if (
      markerCoords.latitude < -90 ||
      markerCoords.latitude > 90 ||
      markerCoords.longitude < -180 ||
      markerCoords.longitude > 180
    ) {
      errors.location = 'Invalid coordinates'
    }

    if (!addressComponents.formattedAddress) {
      errors.address = 'Please select a valid address'
    }

    if (size && (size <= 0 || size > 99999)) errors.size = 'Size must be between 1 and 99999'
    if (price && (price <= 0 || price > (operationTypes === 'rent' ? 999999 : 999999999))) {
      errors.price = `Price must be between 1 and ${operationTypes === 'rent' ? '999,999' : '999,999,999'}`
    }

    if (hasContructionYear && constructionYear) {
      const yearNum = parseInt(constructionYear)
      const currentYear = new Date().getFullYear()
      if (yearNum > currentYear) {
        errors.constructionYear = 'Year cannot be in the future'
      } else if (yearNum < 1800) {
        errors.constructionYear = 'Year seems too old'
      }
    }

    if (hasFloorNumber && floorNumber === null) {
      errors.floorNumber = 'Floor number is required'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handlePublish = async () => {
    if (!validatePropertyData()) {
      return
    }
    try {
      const data = await createProperty(propertyPayload, INSTARENT_API_KEY)
      const newPropertyId = data.property.id

      Alert.alert('Success', 'Property added successfully')
      router.replace({
        pathname: '/(root)/(properties)/addPictures',
        params: { propertyId: newPropertyId }
      })
    } catch (error) {

      console.error('Failed to create property:', error)
    }
  }

  const handleEdit = async () => {
    if (!validatePropertyData()) {
      return
    }
    try {
      await editProperty(propertyPayload, INSTARENT_API_KEY)
      Alert.alert('Success', 'Property edited successfully')
      router.replace('/(root)/(properties)/myProperties')
    } catch (error) {

      console.error('Failed to edit property:', error)
    }
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: !edit ? 'Place your advert' : 'Edit Property',
      headerTitleAlign: 'center'
    })
  }, [navigation, edit])

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'web') {
        !edit ? (document.title = 'Publish') : (document.title = 'Edit Property')
      }
    }, [])
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
                  size,
                  propertyid,
                  edit: edit ? 'true' : 'false'
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
                  size,
                  propertyid,
                  edit: edit ? 'true' : 'false'
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
          {validationErrors.size && (
            <Text className="text-red-500 text-sm mb-2">{validationErrors.size}</Text>
          )}

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
          {validationErrors.price && (
            <Text className="text-red-500 text-sm mb-2">{validationErrors.price}</Text>
          )}

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
                  size,
                  propertyid,
                  edit: edit ? 'true' : 'false'
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
          {validationErrors.location && (
            <Text className="text-red-500 text-sm mb-2">{validationErrors.location}</Text>
          )}
          {validationErrors.address && (
            <Text className="text-red-500 text-sm mb-2">{validationErrors.address}</Text>
          )}

          <View className="flex-row items-center space-x-2 mb-4">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={getCurrentLocation}
              className="flex-row items-center bg-darkBlue px-4 py-2 rounded-xl">
              <Ionicons name="location" size={20} color="white" />
              <Text className="text-white ml-2">Use Current Location</Text>
            </TouchableOpacity>
          </View>

          {Platform.OS === 'web' ? (
            <AddressAutocomplete
              onPlaceSelected={(place) => {
                if (!place.geometry || !place.geometry.location) {
                  console.warn('Location not available for this place.')
                  return
                }

                const lat = place.geometry.location.lat?.()
                const lng = place.geometry.location.lng?.()

                if (lat !== undefined && lng !== undefined) {
                  setMarkerCoords({ latitude: lat, longitude: lng })
                  setShowMarker(true)
                  fetchAddressFromCoords(lat, lng)
                } else {
                  console.warn('Could not get lat/lng.')
                }
              }}
            />
          ) : (
            <MapPreview
              initialLatitude={markerCoords.latitude}
              initialLongitude={markerCoords.longitude}
              showMarker={showMarker}
              move={false}
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
                    size,
                    propertyid,
                    edit: edit ? 'true' : 'false'
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
                value={hasFloorNumber}
                onValueChange={setHasFloorNumber}
                trackColor={{ false: '#ccc', true: '#353949' }}
                thumbColor="#fff"
              />
            </View>

            {hasFloorNumber && (
              <View>
                <Text className="text-sm text-gray-500 mb-1">Insert Floor number (ej: 2A)</Text>
                <View className="flex-row items-center rounded-xl border border-gray-400 h-14 px-4 mb-4">
                  <TextInput
                    keyboardType="numeric"
                    className="flex-1 text-lg h-full"
                    placeholder="Floor"
                    placeholderTextColor="gray"
                    value={floorNumber !== null ? floorNumber.toString() : ''}
                    onChangeText={(text) => handleNumericInput(text, setFloorNumber, 99999)}
                  />

                  <TextInput
                    keyboardType="default"
                    className="border-l border-gray-400 pl-4 flex-1 text-lg h-full capitalize"
                    placeholder="Letter (optional)"
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
              onValueChange={setHasContructionYear}
              trackColor={{ false: '#ccc', true: '#353949' }}
              thumbColor="#fff"
            />
          </View>

          {hasContructionYear && (
            <View>
              <Text className="text-sm text-gray-500 mb-1">Insert construction year (YYYY)</Text>
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
                      if (year.length === 4) {
                        const yearNum = parseInt(year)
                        const currentYear = new Date().getFullYear()
                        if (yearNum > currentYear) {
                          setConstructionYearError('Year cannot be in the future')
                        } else if (yearNum < 1800) {
                          setConstructionYearError('Year seems too old')
                        } else {
                          setConstructionYearError('')
                        }
                      } else if (year.length > 0) {
                        setConstructionYearError('Please enter a complete 4-digit year')
                      } else {
                        setConstructionYearError('')
                      }
                    }
                  }}
                />
              </View>
              {constructionYearError ? (
                <Text className="text-red-500 text-sm mb-2">{constructionYearError}</Text>
              ) : null}
              <Text className="text-xs text-gray-500 mb-4">
                Enter a year between 1800 and {new Date().getFullYear()}
              </Text>
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
          {validationErrors.description && (
            <Text className="text-red-500 text-sm mb-2">{validationErrors.description}</Text>
          )}
        </View>
      </ScrollView>

      <View className="bg-white border-t border-gray-200 px-4 py-3 pb-10">
        <View className="flex-row justify-between">
          <TouchableOpacity
            className="w-[48%] h-16 flex-row items-center border-2 border-darkBlue justify-center rounded-xl bg-white p-4"
            onPress={() => {
              if (Platform.OS !== 'web') {
                Alert.alert('Discard changes?', 'If you go back now, you will lose your changes.', [
                  {
                    text: 'Discard changes',
                    onPress: () => router.back(),
                    style: 'destructive'
                  },
                  {
                    text: 'Keep editing',
                    style: 'cancel'
                  }
                ])
              } else {
                router.back()
              }
            }}>
            <Text className="text-base font-semibold text-darkBlue">Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-[48%] h-16 flex-row items-center justify-center rounded-xl bg-darkBlue p-4"
            onPress={!edit ? handlePublish : handleEdit}>
            <Text className="text-base font-semibold text-white">Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

export default PublishPage
