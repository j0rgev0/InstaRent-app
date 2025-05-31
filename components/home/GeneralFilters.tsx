import {
  buildingFeaturesOptions,
  interiorFeaturesOptions,
  outdoorFeaturesOptions,
  parkingTransportOptions,
  propertyTypes
} from '@/utils/optionsData'
import Ionicons from '@expo/vector-icons/build/Ionicons'
import Slider from '@react-native-community/slider'
import { Picker } from '@react-native-picker/picker'
import React, { useState } from 'react'
import { Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

interface GeneralFiltersProps {
  filters: {
    operation: string
    type: string[]
    features: string[]
    minSize: string
    maxSize: string
    minPrice: string
    maxPrice: string
  }
  setFilters: (filters: any) => void
  priceRange: {
    min: number
    max: number
  }
  setPriceRange: (
    range:
      | { min: number; max: number }
      | ((prev: { min: number; max: number }) => { min: number; max: number })
  ) => void
  handleApplyFilters: () => void
  clearGeneralFilters: () => void
}

const GeneralFilters = ({
  filters,
  setFilters,
  priceRange,
  setPriceRange,
  handleApplyFilters,
  clearGeneralFilters
}: GeneralFiltersProps) => {
  const [showOperationFilter, setShowOperationFilter] = useState(false)
  const [showTypesFilter, setShowTypesFilter] = useState(false)
  const [showFeaturesFilter, setShowFeaturesFilter] = useState(false)
  const [showSizeFilter, setShowSizeFilter] = useState(false)
  const [showPriceFilter, setShowPriceFilter] = useState(false)

  const getMaxPrice = () => {
    return filters.operation === 'rent' ? 10000 : 9999999
  }

  const getStepSize = () => {
    return filters.operation === 'rent' ? 100 : 1000
  }

  const formatPrice = (value: number) => {
    if (filters.operation === 'rent') {
      return `€${value.toLocaleString()}/month`
    }
    return `€${value.toLocaleString()}`
  }

  return (
    <ScrollView
      className="bg-white/80 p-4 pb-6 rounded-2xl mx-4"
      style={{
        position: 'absolute',
        top: 85,
        left: 10,
        right: 10,
        zIndex: 10
      }}>
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-bold">Filters</Text>
        <TouchableOpacity onPress={clearGeneralFilters} className="bg-red-500 px-4 py-2 rounded-xl">
          <Text className="text-white font-semibold">Clear All</Text>
        </TouchableOpacity>
      </View>

      <Pressable
        onPress={() => setShowOperationFilter(!showOperationFilter)}
        className="flex-row items-center pb-2">
        <Text className="text-lg">Operation</Text>
        <Ionicons name={showOperationFilter ? 'chevron-up' : 'chevron-down'} size={20} />
      </Pressable>

      {showOperationFilter && (
        <Picker
          selectedValue={filters.operation}
          onValueChange={(value: string) =>
            setFilters((prev: any) => ({ ...prev, operation: value }))
          }
          style={{ color: 'black' }}>
          <Picker.Item color="black" label="All" value="" />
          <Picker.Item color="black" label="Rent" value="rent" />
          <Picker.Item color="black" label="Sell" value="sell" />
        </Picker>
      )}

      <Pressable
        onPress={() => setShowTypesFilter(!showTypesFilter)}
        className="flex-row items-center pb-2">
        <Text className="text-lg">Type</Text>
        <Ionicons name={showTypesFilter ? 'chevron-up' : 'chevron-down'} size={20} />
      </Pressable>

      {showTypesFilter && (
        <View style={{ maxHeight: 176 }}>
          <ScrollView>
            <View className="flex-row flex-wrap gap-2">
              {propertyTypes.map((type) => {
                const isSelected = filters.type.includes(type)
                return (
                  <TouchableOpacity
                    key={type}
                    onPress={() => {
                      setFilters((prev: any) => {
                        const newTypes = isSelected
                          ? prev.type.filter((t: string) => t !== type)
                          : [...prev.type, type]
                        return { ...prev, type: newTypes }
                      })
                    }}
                    className={`border rounded-2xl px-4 py-2 shadow-sm ${
                      isSelected ? 'bg-darkBlue border-darkBlue' : 'bg-white  border-darkBlue'
                    }`}>
                    <Text className={`capitalize ${isSelected ? 'text-white' : ''}`}>{type}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </ScrollView>
        </View>
      )}

      <Pressable
        onPress={() => setShowFeaturesFilter(!showFeaturesFilter)}
        className="flex-row items-center pb-2">
        <Text className="text-lg">Features</Text>
        <Ionicons name={showFeaturesFilter ? 'chevron-up' : 'chevron-down'} size={20} />
      </Pressable>

      {showFeaturesFilter && (
        <ScrollView style={{ maxHeight: 300 }}>
          <Text className="mb-2 text-lg">Interior Features</Text>
          <ScrollView>
            <View className="flex-row flex-wrap gap-2">
              {interiorFeaturesOptions.map(({ label, value }) => {
                const isSelected = filters.features.includes(value)
                return (
                  <TouchableOpacity
                    key={value}
                    onPress={() => {
                      setFilters((prev: any) => {
                        const newFeature = isSelected
                          ? prev.features.filter((t: string) => t !== value)
                          : [...prev.features, value]
                        return { ...prev, features: newFeature }
                      })
                    }}
                    className={`border rounded-2xl px-4 py-2 shadow-sm ${
                      isSelected ? 'bg-darkBlue border-darkBlue' : 'bg-white  border-darkBlue'
                    }`}>
                    <Text className={`capitalize ${isSelected ? 'text-white' : ''}`}>{label}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </ScrollView>

          <Text className="mb-2 text-lg">Building Features</Text>
          <ScrollView>
            <View className="flex-row flex-wrap gap-2 mb-2">
              {buildingFeaturesOptions.map(({ label, value }) => {
                const isSelected = filters.features.includes(value)
                return (
                  <TouchableOpacity
                    key={value}
                    onPress={() => {
                      setFilters((prev: any) => {
                        const newFeature = isSelected
                          ? prev.features.filter((t: string) => t !== value)
                          : [...prev.features, value]
                        return { ...prev, features: newFeature }
                      })
                    }}
                    className={`border rounded-2xl px-4 py-2 shadow-sm ${
                      isSelected ? 'bg-darkBlue border-darkBlue' : 'bg-white  border-darkBlue'
                    }`}>
                    <Text className={`capitalize ${isSelected ? 'text-white' : ''}`}>{label}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </ScrollView>

          <Text className="mb-2 text-lg">Outdoor Features</Text>
          <ScrollView>
            <View className="flex-row flex-wrap gap-2 mb-2">
              {outdoorFeaturesOptions.map(({ label, value }) => {
                const isSelected = filters.features.includes(value)
                return (
                  <TouchableOpacity
                    key={value}
                    onPress={() => {
                      setFilters((prev: any) => {
                        const newFeature = isSelected
                          ? prev.features.filter((t: string) => t !== value)
                          : [...prev.features, value]
                        return { ...prev, features: newFeature }
                      })
                    }}
                    className={`border rounded-2xl px-4 py-2 shadow-sm ${
                      isSelected ? 'bg-darkBlue border-darkBlue' : 'bg-white  border-darkBlue'
                    }`}>
                    <Text className={`capitalize ${isSelected ? 'text-white' : ''}`}>{label}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </ScrollView>

          <Text className="mb-2 text-lg">Parking & Transport</Text>
          <ScrollView>
            <View className="flex-row flex-wrap gap-2 mb-2">
              {parkingTransportOptions.map(({ label, value }) => {
                const isSelected = filters.features.includes(value)
                return (
                  <TouchableOpacity
                    key={value}
                    onPress={() => {
                      setFilters((prev: any) => {
                        const newFeature = isSelected
                          ? prev.features.filter((t: string) => t !== value)
                          : [...prev.features, value]
                        return { ...prev, features: newFeature }
                      })
                    }}
                    className={`border rounded-2xl px-4 py-2 shadow-sm ${
                      isSelected ? 'bg-darkBlue border-darkBlue' : 'bg-white  border-darkBlue'
                    }`}>
                    <Text className={`capitalize ${isSelected ? 'text-white' : ''}`}>{label}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </ScrollView>
        </ScrollView>
      )}

      <Pressable
        onPress={() => setShowSizeFilter(!showSizeFilter)}
        className="flex-row items-center pb-2">
        <Text className="text-lg">Size Range (m²)</Text>
        <Ionicons name={showSizeFilter ? 'chevron-up' : 'chevron-down'} size={20} />
      </Pressable>

      {showSizeFilter && (
        <View className="flex-row items-center space-x-2 mb-4">
          <View className="flex-1">
            <Text className="text-sm mb-1">Min Size</Text>
            <TextInput
              className="px-4 py-2 border border-gray-300 rounded-2xl bg-gray-100 text-base"
              placeholder="Min size"
              keyboardType="numeric"
              value={filters.minSize}
              onChangeText={(value) => setFilters((prev: any) => ({ ...prev, minSize: value }))}
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm mb-1">Max Size</Text>
            <TextInput
              className="px-4 py-2 border border-gray-300 rounded-2xl bg-gray-100 text-base"
              placeholder="Max size"
              keyboardType="numeric"
              value={filters.maxSize}
              onChangeText={(value) => setFilters((prev: any) => ({ ...prev, maxSize: value }))}
            />
          </View>
        </View>
      )}

      <Pressable
        onPress={() => setShowPriceFilter(!showPriceFilter)}
        className="flex-row items-center pb-2">
        <Text className="text-lg">Price Range (€)</Text>
        <Ionicons name={showPriceFilter ? 'chevron-up' : 'chevron-down'} size={20} />
      </Pressable>

      {showPriceFilter && (
        <View className="mb-4 px-2">
          <View className="flex-row justify-between mb-2">
            <Text className="text-base">Min: {formatPrice(priceRange.min)}</Text>
            <Text className="text-base">Max: {formatPrice(priceRange.max)}</Text>
          </View>
          <View className="flex-row items-center space-x-4">
            <Slider
              style={{ flex: 1, height: 40 }}
              minimumValue={0}
              maximumValue={getMaxPrice()}
              step={getStepSize()}
              value={priceRange.min}
              onValueChange={(value: number) => {
                setPriceRange((prev: { min: number; max: number }) => ({
                  ...prev,
                  min: Math.min(value, prev.max - getStepSize())
                }))
                setFilters((prev: any) => ({
                  ...prev,
                  minPrice: value.toString()
                }))
              }}
              minimumTrackTintColor="#353949"
              maximumTrackTintColor="#fff"
              thumbTintColor="#353949"
            />
            <Slider
              style={{ flex: 1, height: 40 }}
              minimumValue={0}
              maximumValue={getMaxPrice()}
              step={getStepSize()}
              value={priceRange.max}
              onValueChange={(value: number) => {
                setPriceRange((prev: { min: number; max: number }) => ({
                  ...prev,
                  max: Math.max(value, prev.min + getStepSize())
                }))
                setFilters((prev: any) => ({
                  ...prev,
                  maxPrice: value.toString()
                }))
              }}
              minimumTrackTintColor="#353949"
              maximumTrackTintColor="#fff"
              thumbTintColor="#353949"
            />
          </View>
        </View>
      )}

      <TouchableOpacity onPress={handleApplyFilters} className="bg-darkBlue p-3 rounded-2xl">
        <Text className="text-white text-center font-bold">Apply Filters</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

export default GeneralFilters
