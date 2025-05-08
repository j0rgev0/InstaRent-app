import React from 'react'

import { ActivityIndicator, Text, TouchableOpacity } from 'react-native'

interface ButtonProps {
  title: string
  loadingTitle?: string
  loading?: boolean
  onPress: () => void
}

const Button = ({ title, loadingTitle = title, loading = false, onPress }: ButtonProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.77}
      className="flex-row items-center justify-center gap-2 rounded-md bg-darkBlue p-4"
      onPress={onPress}
      disabled={loading}>
      {loading && <ActivityIndicator color={'white'} />}
      <Text className="text-lg font-bold text-white">{loading ? loadingTitle : title}</Text>
    </TouchableOpacity>
  )
}

export default Button
