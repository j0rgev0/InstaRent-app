import React from 'react'
import { Text, TouchableOpacity } from 'react-native'

import * as ExpoImagePicker from 'expo-image-picker'

type AppImage = {
  uri: string
}

type Props = {
  onSelect: (images: AppImage[]) => void
}

const ImageSelectorExpo: React.FC<Props> = ({ onSelect }) => {
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
      allowsMultipleSelection: true
    })

    if (!result.canceled) {
      const images = result.assets.map((asset) => ({ uri: asset.uri }))
      onSelect(images)
    }
  }

  return (
    <TouchableOpacity
      onPress={selectImages}
      style={{
        backgroundColor: 'blue',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16
      }}>
      <Text style={{ color: 'white', textAlign: 'center' }}>Select Images</Text>
    </TouchableOpacity>
  )
}

export default ImageSelectorExpo
