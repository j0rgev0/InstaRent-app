import { departmentsOfFrance, provincesOfSpain, suportCountries } from '@/utils/optionsData'
import Ionicons from '@expo/vector-icons/build/Ionicons'
import React, { useState } from 'react'
import { Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

interface LocationFiltersProps {
  filters: {
    province: string[]
    country: string[]
    locality: string
  }
  setFilters: (filters: any) => void
  currentAddress: string
  setCurrentAddress: (address: string) => void
  isLoadingLocation: boolean
  getCurrentLocation: () => void
  handleApplyFilters: () => void
  clearLocationFilters: () => void
}

const MAX_DISPLAY_LENGTH = 30

const LocationFilters = ({
  filters,
  setFilters,
  currentAddress,
  setCurrentAddress,
  isLoadingLocation,
  getCurrentLocation,
  handleApplyFilters,
  clearLocationFilters
}: LocationFiltersProps) => {
  const [showCountryFilters, setShowCountryFilters] = useState(false)
  const [showProvinceFilter, setShowProvinceFilter] = useState(false)
  const [showLocalityFilter, setShowLocalityFilter] = useState(false)

  const updateSelectedProvince = (value: string, isSelected: boolean) => {
    setFilters((prev: any) => {
      const newProvince = isSelected
        ? prev.province.filter((t: string) => t !== value)
        : [...prev.province, value]
      return { ...prev, province: newProvince }
    })

    setFilters((prev: any) => {
      const selectedProvinces = prev.province
        .map((p: string) => {
          for (const country of prev.country) {
            const provinces = getProvincesByCountry(country)
            const province = provinces.find((prov) => prov.value === p)
            if (province) return province.label
          }
          return ''
        })
        .filter(Boolean)

      if (selectedProvinces.length > 0) {
        let displayText = selectedProvinces.join(', ')
        if (displayText.length > MAX_DISPLAY_LENGTH) {
          displayText = displayText.substring(0, MAX_DISPLAY_LENGTH) + '...'
        }
        setCurrentAddress(displayText)
      } else {
        setCurrentAddress('')
      }
      return prev
    })
  }

  const updateSelectedCountry = (value: string, isSelected: boolean) => {
    setFilters((prev: any) => {
      const newCountry = isSelected
        ? prev.country.filter((t: string) => t !== value)
        : [...prev.country, value]

      if (isSelected) {
        const provincesToKeep = prev.province.filter((province: string) => {
          const countryProvinces = getProvincesByCountry(value)
          return !countryProvinces.some((p) => p.value === province)
        })
        return { ...prev, country: newCountry, province: provincesToKeep }
      }

      return { ...prev, country: newCountry }
    })
  }

  const getProvincesByCountry = (country: string) => {
    switch (country) {
      case 'spain':
        return provincesOfSpain
      case 'france':
        return departmentsOfFrance
      default:
        return []
    }
  }

  return (
    <ScrollView
      className="bg-white/80 p-4 pb-6 rounded-2xl mx-4"
      style={{
        position: 'absolute',
        top: 85,
        right: 10,
        left: 10,
        zIndex: 10
      }}>
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-bold">Location Filters</Text>
        <TouchableOpacity
          onPress={clearLocationFilters}
          className="bg-red-500 px-4 py-2 rounded-xl">
          <Text className="text-white font-semibold">Clear All</Text>
        </TouchableOpacity>
      </View>

      <Pressable
        onPress={() => setShowCountryFilters(!showCountryFilters)}
        className="flex-row items-center pb-2">
        <Text className="text-lg">Country</Text>
        <Ionicons name={showCountryFilters ? 'chevron-up' : 'chevron-down'} size={20} />
      </Pressable>

      {showCountryFilters && (
        <View>
          <View style={{ maxHeight: 176 }}>
            <ScrollView>
              <View className="flex-row flex-wrap gap-2">
                {suportCountries.map(({ label, value }) => {
                  const isSelected = filters.country.includes(value)
                  return (
                    <TouchableOpacity
                      key={value}
                      onPress={() => updateSelectedCountry(value, isSelected)}
                      className={`border rounded-2xl px-4 py-2 shadow-sm ${
                        isSelected ? 'bg-darkBlue border-darkBlue' : 'bg-white  border-darkBlue'
                      }`}>
                      <Text className={`capitalize ${isSelected ? 'text-white' : ''}`}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      <Pressable
        onPress={() => setShowProvinceFilter(!showProvinceFilter)}
        className="flex-row items-center pb-2">
        <Text className="text-lg">Province</Text>
        <Ionicons name={showProvinceFilter ? 'chevron-up' : 'chevron-down'} size={20} />
      </Pressable>

      {showProvinceFilter && (
        <View>
          <View style={{ maxHeight: 200 }}>
            <ScrollView>
              {filters.country.map((country) => {
                const provinces = getProvincesByCountry(country)
                const countryLabel =
                  suportCountries.find((c) => c.value === country)?.label || country

                return (
                  <View key={country} className="mb-4">
                    <Text className="text-lg font-semibold mb-2 capitalize">{countryLabel}</Text>
                    <View className="flex-row flex-wrap gap-2">
                      {provinces.map(({ label, value }) => {
                        const isSelected = filters.province.includes(value)
                        return (
                          <TouchableOpacity
                            key={value}
                            onPress={() => updateSelectedProvince(value, isSelected)}
                            className={`border rounded-2xl px-4 py-2 shadow-sm ${
                              isSelected
                                ? 'bg-darkBlue border-darkBlue'
                                : 'bg-white  border-darkBlue'
                            }`}>
                            <Text className={`capitalize ${isSelected ? 'text-white' : ''}`}>
                              {label}
                            </Text>
                          </TouchableOpacity>
                        )
                      })}
                    </View>
                  </View>
                )
              })}
            </ScrollView>
          </View>
        </View>
      )}

      <Pressable
        onPress={() => setShowLocalityFilter(!showLocalityFilter)}
        className="flex-row items-center pb-2">
        <Text className="text-lg">Locality</Text>
        <Ionicons name={showLocalityFilter ? 'chevron-up' : 'chevron-down'} size={20} />
      </Pressable>

      {showLocalityFilter && (
        <View>
          <TextInput
            className="mb-2 px-4 py-2 border border-gray-300 rounded-2xl bg-gray-100 text-base capitalize"
            placeholder="Enter your locality"
            placeholderTextColor="#999"
            value={filters.locality}
            onChangeText={(value: string) =>
              setFilters((prev: any) => ({ ...prev, locality: value }))
            }
          />
        </View>
      )}

      <TouchableOpacity
        onPress={getCurrentLocation}
        disabled={isLoadingLocation}
        className="flex-row items-center space-x-2 mt-2">
        <Ionicons name="location" size={20} color={isLoadingLocation ? '#999' : '#000'} />
        <Text style={{ color: isLoadingLocation ? '#999' : '#000' }}>
          {isLoadingLocation ? 'Getting location...' : 'Use current location'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          handleApplyFilters()
        }}
        className="bg-darkBlue p-3 rounded-2xl mt-2">
        <Text className="text-white text-center font-bold">Apply Location Filters</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

export default LocationFilters
