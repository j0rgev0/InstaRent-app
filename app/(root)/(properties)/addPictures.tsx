import React, { useState } from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'

import { router } from 'expo-router'

import ImageCarousel from '@/components/selectImages/ImageCarousel'
import ImageSelector from '@/components/selectImages/ImageSelector'

type AppImage = {
  uri: string
}

const AddPictures = () => {
  const SELECTIONLIMIT = 30

  const [images, setImages] = useState<AppImage[]>([])
  const disabledSelect = images.length >= SELECTIONLIMIT

  const handleSelectImages = (newImages: AppImage[]) => {
    const availableSlots = SELECTIONLIMIT - images.length
    const imagesToAdd = newImages.slice(0, availableSlots)

    setImages((prev) => [...prev, ...imagesToAdd])
  }

  const handleRemoveImage = (uri: string) => {
    setImages((prev) => prev.filter((img) => img.uri !== uri))
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
            onPress={() => {
              if (images.length > 0) {
                // Continúa con la lógica
              }
            }}
            disabled={images.length === 0}>
            <Text className="text-base font-semibold text-white">Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default AddPictures
