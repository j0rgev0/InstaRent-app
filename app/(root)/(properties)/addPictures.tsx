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
import { INSTARENT_API_KEY, INSTARENT_API_URL } from '@/utils/constants'

type AppImage = {
  uri: string
}

const AddPictures = () => {
  const params = useLocalSearchParams()

  const SELECTIONLIMIT = 30

  const propertyId = Array.isArray(params.propertyId)
    ? params.propertyId[0]
    : params.propertyId || '' // '2e6436fb-4f77-4eaf-b135-032be2368618'

  const [imagesAdded, setImagesAdded] = useState(0)
  const [images, setImages] = useState<AppImage[]>([])
  const [isLoading, setIsLoading] = useState(false)

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

  const handleSelectImages = (newImages: AppImage[]) => {
    const availableSlots = SELECTIONLIMIT - images.length
    const imagesToAdd = newImages.slice(0, availableSlots)
    setImages((prev) => [...prev, ...imagesToAdd])
  }

  const handleRemoveImage = (uri: string) => {
    setImages((prev) => prev.filter((img) => img.uri !== uri))
  }

  const handleAddImage = async () => {
    if (images.length >= 1) {
      setIsLoading(true)
      setImagesAdded(0)
      try {
        for (const image of images) {
          await addImage({ uri: image.uri, propertyId })
          setImagesAdded((prev) => prev + 1)
        }
        router.back()
      } catch (error) {
        console.log('Error adding images')
        Alert.alert('Error adding images. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 px-5 pt-5" showsVerticalScrollIndicator={false}>
        <View className="items-center border-b border-gray-300 pb-5">
          <Text className="text-xl font-semibold text-gray-800 mb-2">
            Add pictures for your property
          </Text>

          <ImageSelector
            onSelect={handleSelectImages}
            selectionLimit={SELECTIONLIMIT}
            selected={images.length}
            disabled={disabledSelect}
          />

          <ImageCarousel images={images} onRemove={handleRemoveImage} />
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 pb-10">
        <View className="flex-row justify-between">
          <TouchableOpacity
            className="w-[48%] h-16 flex-row items-center border-2 border-darkBlue justify-center rounded-xl bg-white p-4"
            onPress={() => router.back()}
            disabled={isLoading}>
            <Text className="text-base font-semibold text-darkBlue">Maybe later</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`w-[48%] h-16 flex-row items-center justify-center rounded-xl p-4 ${
              images.length === 0 || isLoading ? 'bg-gray-400' : 'bg-darkBlue'
            }`}
            onPress={handleAddImage}
            disabled={images.length === 0 || isLoading}>
            {isLoading ? (
              <View className="flex-row items-center space-x-2">
                <ActivityIndicator color="#fff" />
                <Text className="ml-1 text-sm font-semibold text-white">
                  {imagesAdded} / {images.length} added images
                </Text>
              </View>
            ) : (
              <Text className="text-base font-semibold text-white">Continue</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default AddPictures
