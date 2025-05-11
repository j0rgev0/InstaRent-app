import React from 'react'
import { Text, TouchableOpacity } from 'react-native'

import * as ExpoImagePicker from 'expo-image-picker'

type AppImage = {
  uri: string
}

type Props = {
  onSelect: (images: AppImage[]) => void
}

const ImageSelector: React.FC<Props> = ({ onSelect }) => {
  const selectImages = async () => {
    const { status } = await ExpoImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      alert('Permission required')
      return
    }

    const result = await ExpoImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      aspect: [1, 1],
      base64: false,
      mediaTypes: 'images',
      allowsMultipleSelection: true,
      selectionLimit: 30
    })

    if (!result.canceled) {
      const images = result.assets.map((asset) => ({ uri: asset.uri }))
      onSelect(images)
    }
  }

  return (
    <TouchableOpacity
      onPress={selectImages}
      className="bg-blue-600 px-6 py-3 rounded-lg w-11/12 items-center"
      activeOpacity={0.8}>
      <Text className="text-white font-medium text-lg">Select Image</Text>
    </TouchableOpacity>
  )
}

export default ImageSelector
