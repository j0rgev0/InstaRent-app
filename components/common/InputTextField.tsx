import React, { useState } from 'react'

import { KeyboardType, Text, TextInput, TouchableOpacity, View } from 'react-native'

import { Ionicons } from '@expo/vector-icons'

import '@/global.css'

interface InputTextFieldProps {
  subtitle?: string
  iconName?: keyof typeof Ionicons.glyphMap
  placeholder: string
  value: string
  onChangeText: (text: string) => void
  secureTextEntry?: boolean
  editable?: boolean
  keyboardType?: KeyboardType
}

const InputTextField = ({
  subtitle,
  iconName,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  editable = true,
  keyboardType = 'default'
}: InputTextFieldProps) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <View className="gap-2">
      {subtitle && <Text className="pt-5 text-sm font-bold">{subtitle}</Text>}
      <View className="h-14 flex-row items-center rounded-md border border-black">
        {iconName && <Ionicons name={iconName} size={24} color="black" className="p-2" />}
        <TextInput
          className="flex-1"
          placeholder={placeholder}
          placeholderTextColor={'gray'}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          editable={editable}
          keyboardType={keyboardType}
        />
        {secureTextEntry && (
          <TouchableOpacity className="p-2" onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="gray" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

export default InputTextField
