import React, { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

import { router, useLocalSearchParams } from 'expo-router'

import ImageCarousel from '@/components/selectImages/ImageCarousel'
import ImageSelector from '@/components/selectImages/ImageSelector'
import FeatureBox from '@/components/selectfeatures/FeatureBox'

import { INSTARENT_API_KEY, INSTARENT_API_URL } from '@/utils/constants'

import '@/global.css'

type AppImage = {
  uri: string
}

const interiorFeaturesOptions = [
  { label: 'Living room', value: 'livingroom' },
  { label: 'Dining room', value: 'diningroom' },
  { label: 'Kitchen', value: 'kitchen' },
  { label: 'Open-plan kitchen', value: 'openkitchen' },
  { label: 'Fully furnished', value: 'fullyfurnished' },
  { label: 'Partially furnished', value: 'partiallyfurnished' },
  { label: 'Unfurnished', value: 'unfurnished' },
  { label: 'Built-in wardrobes', value: 'builtinwardrobes' },
  { label: 'Air conditioning', value: 'airconditioning' },
  { label: 'Heating', value: 'heating' },
  { label: 'Fireplace', value: 'fireplace' },
  { label: 'Balcony', value: 'balcony' },
  { label: 'Terrace', value: 'terrace' },
  { label: 'Laundry room', value: 'laundryroom' },
  { label: 'Storage room', value: 'storageroom' },
  { label: 'Smart home system', value: 'smarthomesystem' }
]

const buildingFeaturesOptions = [
  { label: 'Elevator', value: 'elevator' },
  { label: 'Doorman service', value: 'doormanservice' },
  { label: 'Security system', value: 'securitysystem' },
  { label: '24h surveillance', value: 'surveillance24h' },
  { label: 'Concierge service', value: 'conciergeservice' },
  { label: 'Gated community', value: 'gatedcommunity' },
  { label: 'Wheelchair accessible', value: 'wheelchairaccessible' }
]

const outdoorFeaturesOptions = [
  { label: 'Private pool', value: 'privateswimmingpool' },
  { label: 'Communal pool', value: 'communalswimmingpool' },
  { label: 'Private garden', value: 'privategarden' },
  { label: 'Communal garden', value: 'communalgarden' },
  { label: 'Playground', value: 'playground' },
  { label: 'Gym', value: 'gym' },
  { label: 'Rooftop', value: 'rooftop' },
  { label: 'Solarium', value: 'solarium' },
  { label: 'Barbecue area', value: 'barbecuearea' },
  { label: 'Sports facilities', value: 'sportsfacilities' },
  { label: 'Clubhouse', value: 'clubhouse' },
  { label: 'Community room', value: 'communityroom' }
]

const parkingTransportOptions = [
  { label: 'Private parking', value: 'privateparking' },
  { label: 'Communal parking', value: 'communalparking' },
  { label: 'Underground garage', value: 'undergroundgarage' },
  { label: 'Bicycle storage', value: 'bicyclestorage' },
  { label: 'EV charging point', value: 'evchargingpoint' },
  { label: 'Near station or stop', value: 'nearstation' },
  { label: 'Good public transport connection', value: 'goodpublictransport' }
]

const locationOptions = [
  { label: 'Quiet area', value: 'quietarea' },
  { label: 'City center', value: 'citycenter' },
  { label: 'Sea view', value: 'seaview' },
  { label: 'Mountain view', value: 'mountainview' },
  { label: 'Park view', value: 'parkview' },
  { label: 'Beachfront', value: 'beachfront' },
  { label: 'Near the beach', value: 'nearthebeach' },
  { label: 'Near shops', value: 'nearshops' },
  { label: 'Near schools', value: 'nearschools' },
  { label: 'Near restaurants', value: 'nearrestaurants' },
  { label: 'Good neighborhood', value: 'goodneighborhood' },
  { label: 'Green areas nearby', value: 'greenareas' }
]

const AddPictures = () => {
  const params = useLocalSearchParams()

  const SELECTIONLIMIT = 30

  const propertyId = Array.isArray(params.propertyId)
    ? params.propertyId[0]
    : params.propertyId || ''

  const [imagesAdded, setImagesAdded] = useState(0)
  const [images, setImages] = useState<AppImage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [featuresAdded, setFeaturesAdded] = useState(0)
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])

  const disabledSelect = images.length >= SELECTIONLIMIT

  async function addImage(propertyData: { uri: string; propertyId: string }) {
    try {
      const formData = new FormData()

      if (Platform.OS === 'web') {
        const response = await fetch(propertyData.uri)
        const blob = await response.blob()
        formData.append('image', blob, 'photo.jpg')
      } else {
        formData.append('image', {
          uri: propertyData.uri,
          name: 'photo.jpg',
          type: 'image/jpeg'
        } as any)
      }

      formData.append('property_id', propertyData.propertyId)

      const response = await fetch(`${INSTARENT_API_URL}/images/new`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${INSTARENT_API_KEY}`
        },
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error adding new Image')
      }

      return data
    } catch (error) {
      console.error('Error adding new Image', error)
      throw error
    }
  }

  async function addFeature(propertyData: any) {
    try {
      const response = await fetch(`${INSTARENT_API_URL}/features/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${INSTARENT_API_KEY}`
        },
        body: JSON.stringify(propertyData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error adding new feature')
      }

      return data
    } catch (error) {
      console.error('Error adding new feature', error)
      throw error
    }
  }

  const handleSelectImages = (newImages: AppImage[]) => {
    const availableSlots = SELECTIONLIMIT - images.length
    const imagesToAdd = newImages.slice(0, availableSlots)
    setImages((prev) => [...prev, ...imagesToAdd])
  }

  const handleRemoveImage = (uri: string) => {
    setImages((prev) => prev.filter((img) => img.uri !== uri))
  }

  const handleAddImageAndFeature = async () => {
    if (images.length >= 1) {
      setIsLoading(true)
      setImagesAdded(0)
      setFeaturesAdded(0)
      try {
        for (const image of images) {
          await addImage({ uri: image.uri, propertyId })
          setImagesAdded((prev) => prev + 1)
        }

        for (const feature of selectedFeatures) {
          const featuresPayload = {
            property_id: propertyId,
            name: feature
          }

          await addFeature(featuresPayload)
          setFeaturesAdded((prev) => prev + 1)
        }

        Alert.alert('Images and features added')
        router.replace('/(root)/(tabs)/profile')
      } catch (error) {
        console.log('Error adding feature')
        Alert.alert('Error adding feature. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const toggleFeature = (value: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    )
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 px-5 pt-5" showsVerticalScrollIndicator={false}>
        <View className="border-b border-gray-300 pb-5 mb-5">
          <Text className="text-xl text-darkBlue font-bold mb-4">Pictures</Text>

          <ImageSelector
            onSelect={handleSelectImages}
            selectionLimit={SELECTIONLIMIT}
            selected={images.length}
            disabled={disabledSelect}
          />

          <View className="w-full items-center mt-3">
            <ImageCarousel images={images} onRemove={handleRemoveImage} />
          </View>
        </View>

        <View className="flex-1 h-full">
          <View className="border-b border-gray-300 pb-5 mb-5">
            <Text className="text-xl text-darkBlue font-bold mb-4">Interior Features</Text>
            <View className="flex-row flex-wrap gap-2">
              {interiorFeaturesOptions.map((item) => (
                <FeatureBox
                  key={item.label}
                  value={item.label}
                  selected={selectedFeatures.includes(item.value)}
                  onPress={() => toggleFeature(item.value)}
                />
              ))}
            </View>
          </View>

          <View className="border-b border-gray-300 pb-5 mb-5">
            <Text className="text-xl text-darkBlue font-bold mb-4">Building Features</Text>
            <View className="flex-row flex-wrap gap-2">
              {buildingFeaturesOptions.map((item) => (
                <FeatureBox
                  key={item.label}
                  value={item.label}
                  selected={selectedFeatures.includes(item.value)}
                  onPress={() => toggleFeature(item.value)}
                />
              ))}
            </View>
          </View>

          <View className="border-b border-gray-300 pb-5 mb-5">
            <Text className="text-xl text-darkBlue font-bold mb-4">Outdoor Features</Text>
            <View className="flex-row flex-wrap gap-2">
              {outdoorFeaturesOptions.map((item) => (
                <FeatureBox
                  key={item.label}
                  value={item.label}
                  selected={selectedFeatures.includes(item.value)}
                  onPress={() => toggleFeature(item.value)}
                />
              ))}
            </View>
          </View>

          <View className="border-b border-gray-300 pb-5 mb-5">
            <Text className="text-xl text-darkBlue font-bold mb-4">Parking & Transport</Text>
            <View className="flex-row flex-wrap gap-2">
              {parkingTransportOptions.map((item) => (
                <FeatureBox
                  key={item.label}
                  value={item.label}
                  selected={selectedFeatures.includes(item.value)}
                  onPress={() => toggleFeature(item.value)}
                />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 pb-10">
        <View className="flex-row justify-between">
          <TouchableOpacity
            className="w-[48%] h-16 flex-row items-center border-2 border-darkBlue justify-center rounded-xl bg-white p-4"
            onPress={() => {
              if (Platform.OS !== 'web') {
                Alert.alert(
                  'Skip for now?',
                  'You can add photos and features later. Do you want to continue without them?',
                  [
                    {
                      text: 'Skip for now',
                      onPress: () => router.back(),
                      style: 'default'
                    },
                    {
                      text: 'Go back',
                      style: 'cancel'
                    }
                  ]
                )
              } else {
                router.back()
              }
            }}
            disabled={isLoading}>
            <Text className="text-base font-semibold text-darkBlue">Maybe later</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`w-[48%] h-16 flex-row items-center justify-center rounded-xl p-4 ${
              images.length === 0 || selectedFeatures.length === 0 || isLoading
                ? 'bg-gray-400'
                : 'bg-darkBlue'
            }`}
            onPress={handleAddImageAndFeature}
            disabled={images.length === 0 || isLoading}>
            {isLoading ? (
              <View className="flex-row items-center space-x-3">
                <ActivityIndicator color="#fff" />
                <View className="ml-2 flex-col">
                  <Text className="text-xs font-semibold text-white">
                    {imagesAdded} / {images.length} added images
                  </Text>
                  <Text className="text-xs font-semibold text-white">
                    {featuresAdded} / {selectedFeatures.length} added features
                  </Text>
                </View>
              </View>
            ) : (
              <View className="flex-row items-center space-x-2">
                <Text className="text-base font-semibold text-white">Continue</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default AddPictures
