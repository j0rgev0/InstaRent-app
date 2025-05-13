import React from 'react'
import { Alert, Text, TouchableOpacity } from 'react-native'

import * as ExpoImagePicker from 'expo-image-picker'

import '@/global.css'

type AppImage = {
  uri: string
}

type Props = {
  onSelect: (images: AppImage[]) => void
  disabled: boolean
  selectionLimit: number
  selected: number
}

const ImageSelector: React.FC<Props> = ({ onSelect, selectionLimit, selected, disabled }) => {
  const selectImages = async () => {
    if (disabled) {
      Alert.alert('Limit reached', 'You can only upload up to 30 images.')
      return
    } else {
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
        selectionLimit: selectionLimit - selected
      })

      if (!result.canceled) {
        const images = result.assets.map((asset) => ({ uri: asset.uri }))
        onSelect(images)
      }
    }
  }

  return (
    <TouchableOpacity
      onPress={selectImages}
      className="bg-blue-600 px-6 py-3 rounded-lg w-full items-center"
      activeOpacity={0.8}>
      <Text className="text-white font-medium text-lg">
        Select Images ({selected}/{selectionLimit})
      </Text>
    </TouchableOpacity>
  )
}

export default ImageSelector
