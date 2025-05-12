import React, { useState } from 'react'
import { Text, View } from 'react-native'

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
    <View className="flex-1 shadow-current p-5 bg-white items-center">
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
  )
}

export default AddPictures
