import React, { useState } from 'react'
import { Text, View } from 'react-native'

import ImageCarousel from '@/components/selectImages/ImageCarousel'
import ImageSelector from '@/components/selectImages/ImageSelector'

type AppImage = {
  uri: string
}

const AddPictures = () => {
  const [images, setImages] = useState<AppImage[]>([])

  const handleSelectImages = (newImages: AppImage[]) => {
    setImages((prev) => [...prev, ...newImages])
  }

  const handleRemoveImage = (uri: string) => {
    setImages((prev) => prev.filter((img) => img.uri !== uri))
  }

  return (
    <View className="flex-1 p-5 bg-white items-center">
      <Text className="text-xl font-semibold text-gray-800 mb-2">
        Add pictures for your property
      </Text>
      <ImageSelector onSelect={handleSelectImages} />
      <ImageCarousel images={images} onRemove={handleRemoveImage} />
    </View>
  )
}

export default AddPictures
