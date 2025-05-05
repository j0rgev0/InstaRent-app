import React from 'react'

import { Text, TouchableOpacity, View } from 'react-native'

import { Ionicons } from '@expo/vector-icons'

type CounterProps = {
  label: string
  value: number
  setValue: (val: number) => void
  min?: number
  max?: number
}

const Counter = ({ label, value, setValue, min = 0, max = 100 }: CounterProps) => {
  const increment = () => {
    if (value < max) setValue(value + 1)
  }

  const decrement = () => {
    if (value > min) setValue(value - 1)
  }

  return (
    <View className="flex-row items-center justify-between mb-4">
      <Text className="text-lg text-black">{label}</Text>
      <View className="flex-row items-center gap-4">
        <TouchableOpacity onPress={decrement} className="px-4 py-2 bg-gray-200 rounded-lg">
          <Ionicons name="remove" size={18}></Ionicons>
        </TouchableOpacity>
        <Text className="text-xl">{value}</Text>
        <TouchableOpacity onPress={increment} className="px-4 py-2 bg-gray-200 rounded-lg">
          <Ionicons name="add" size={18}></Ionicons>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default Counter
