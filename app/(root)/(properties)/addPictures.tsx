import React, { useState } from 'react'
import { Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native'

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
  const propertyId = '2e6436fb-4f77-4eaf-b135-032be2368618' // params.propertyId 

  const [images, setImages] = useState<AppImage[]>([])
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
      try {
        for (const image of images) {
          await addImage({ uri: image.uri, propertyId })
        }

        router.back()
      } catch (error) {
        alert('Error adding images. Please try again.')
      }
    }
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1 px-5 pt-5"
        contentContainerStyle={{ alignItems: 'center', paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}>
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
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 pb-10">
        <View className="flex-row justify-between">
          <TouchableOpacity
            className="w-[48%] h-16 flex-row items-center border-2 border-darkBlue justify-center rounded-xl bg-white p-4"
            onPress={() => router.back()}>
            <Text className="text-base font-semibold text-darkBlue">Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`w-[48%] h-16 flex-row items-center justify-center rounded-xl p-4 ${
              images.length === 0 ? 'bg-gray-400' : 'bg-darkBlue'
            }`}
            onPress={handleAddImage}
            disabled={images.length === 0}>
            <Text className="text-base font-semibold text-white">Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default AddPictures
