import React, { useState } from 'react'
import { View } from 'react-native'

import ImageCarousel from '@/components/selectImages/ImageCarousel'
import ImageSelectorExpo from '@/components/selectImages/ImageSelector'

type AppImage = {
  uri: string
}

const AddPictures = () => {
  const [images, setImages] = useState<AppImage[]>([])

  const handleSelectImages = (newImages: AppImage[]) => {
    setImages((prev) => [...prev, ...newImages])
  }

  return (
    <View style={{ flex: 1, padding: 20, paddingTop: 50 }}>
      <ImageSelectorExpo onSelect={handleSelectImages} />
      <ImageCarousel images={images} />
    </View>
  )
}

export default AddPictures
