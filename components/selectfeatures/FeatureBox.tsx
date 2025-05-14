import React from 'react'
import { Text, TouchableOpacity } from 'react-native'

import '@/global.css'

interface Props {
  value: string
  selected: boolean
  onPress: () => void
}

const FeatureBox = ({ value, selected, onPress }: Props) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className={`border rounded-2xl px-4 py-2 shadow-sm self-start ${
        selected ? 'bg-darkBlue border-darkBlue' : 'bg-white border-darkBlue'
      }`}>
      <Text className={`text-base font-medium ${selected ? 'text-white' : 'text-darkBlue'}`}>
        {value}
      </Text>
    </TouchableOpacity>
  )
}

export default FeatureBox
