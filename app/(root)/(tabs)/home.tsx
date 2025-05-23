import { useFocusEffect } from 'expo-router'
import React, { useCallback, useRef, useState } from 'react'
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

import { INSTARENT_API_KEY, INSTARENT_API_URL } from '@/utils/constants'
import { Property } from '@/utils/types'
import Ionicons from '@expo/vector-icons/build/Ionicons'
import { Picker } from '@react-native-picker/picker'

import '@/global.css'

const { height, width } = Dimensions.get('window')

const propertyTypes = [
  'ruralproperty',
  'groundfloor',
  'townhouse',
  'apartment',
  'penthouse',
  'chalet',
  'duplex',
  'studio',
  'loft'
]

export const provincesOfSpain = [
  { label: 'Álava', value: 'alava' },
  { label: 'Albacete', value: 'albacete' },
  { label: 'Alicante', value: 'alicante' },
  { label: 'Almería', value: 'almeria' },
  { label: 'Asturias', value: 'asturias' },
  { label: 'Ávila', value: 'avila' },
  { label: 'Badajoz', value: 'badajoz' },
  { label: 'Barcelona', value: 'barcelona' },
  { label: 'Burgos', value: 'burgos' },
  { label: 'Cáceres', value: 'caceres' },
  { label: 'Cádiz', value: 'cadiz' },
  { label: 'Cantabria', value: 'cantabria' },
  { label: 'Castellón', value: 'castellon' },
  { label: 'Ciudad Real', value: 'ciudad real' },
  { label: 'Córdoba', value: 'cordoba' },
  { label: 'Cuenca', value: 'cuenca' },
  { label: 'Girona', value: 'girona' },
  { label: 'Granada', value: 'granada' },
  { label: 'Guadalajara', value: 'guadalajara' },
  { label: 'Guipúzcoa', value: 'guipuzcoa' },
  { label: 'Huelva', value: 'huelva' },
  { label: 'Huesca', value: 'huesca' },
  { label: 'Illes Balears', value: 'illes balears' },
  { label: 'Jaén', value: 'jaen' },
  { label: 'A Coruña', value: 'a coruna' },
  { label: 'La Rioja', value: 'la rioja' },
  { label: 'Las Palmas', value: 'las palmas' },
  { label: 'León', value: 'leon' },
  { label: 'Lleida', value: 'lleida' },
  { label: 'Lugo', value: 'lugo' },
  { label: 'Madrid', value: 'madrid' },
  { label: 'Málaga', value: 'malaga' },
  { label: 'Murcia', value: 'murcia' },
  { label: 'Navarra', value: 'navarra' },
  { label: 'Ourense', value: 'ourense' },
  { label: 'Palencia', value: 'palencia' },
  { label: 'Pontevedra', value: 'pontevedra' },
  { label: 'Salamanca', value: 'salamanca' },
  { label: 'Santa Cruz de Tenerife', value: 'santa cruz de tenerife' },
  { label: 'Segovia', value: 'segovia' },
  { label: 'Sevilla', value: 'sevilla' },
  { label: 'Soria', value: 'soria' },
  { label: 'Tarragona', value: 'tarragona' },
  { label: 'Teruel', value: 'teruel' },
  { label: 'Toledo', value: 'toledo' },
  { label: 'Valencia', value: 'valencia' },
  { label: 'Valladolid', value: 'valladolid' },
  { label: 'Vizcaya', value: 'vizcaya' },
  { label: 'Zamora', value: 'zamora' },
  { label: 'Zaragoza', value: 'zaragoza' }
]

const VISIBLE_DOTS = 5
const DOT_SIZE = 8
const DOT_SPACING = 4
const DOT_CONTAINER_WIDTH = VISIBLE_DOTS * (DOT_SIZE + DOT_SPACING)

const HomePage = () => {
  const [properties, setProperties] = useState<Property[]>([])
  const [expandedDescriptions, setExpandedDescriptions] = useState<string[]>([])

  const imageScrollRef = useRef<ScrollView>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const scrollX = useRef(new Animated.Value(0)).current
  const dotsScrollX = useRef(new Animated.Value(0)).current

  const [refreshing, setRefreshing] = useState(false)

  const [filters, setFilters] = useState({
    operation: '',
    type: [] as string[],
    province: [] as string[]
  })

  const [showFilters, setShowFilters] = useState(false)
  const [showOperationFilter, setShowOperationFilter] = useState(false)
  const [showTypesFilter, setShowTypesFilter] = useState(false)
  const [showProvinceFilter, setShowProvinceFilter] = useState(false)

  const fetchProperties = async () => {
    try {
      const queryParams = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => queryParams.append(key, v))
        } else if (value !== '') {
          queryParams.append(key, value)
        }
      })

      const url = `${INSTARENT_API_URL}/properties?${queryParams.toString()}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${INSTARENT_API_KEY}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error getting properties')
      }

      setProperties(Array.isArray(data) ? data : [])
    } catch (error) {
      // console.error('Error getting properties', error)
      setProperties([])
    }
  }

  const onScroll = (event: any, property: Property) => {
    const offsetX = event.nativeEvent.contentOffset.x
    const index = Math.round(offsetX / width)
    setCurrentIndex(index)

    if (property?.images?.length) {
      const startIndex = Math.max(
        0,
        Math.min(index - Math.floor(VISIBLE_DOTS / 2), property.images.length - VISIBLE_DOTS)
      )

      Animated.spring(dotsScrollX, {
        toValue: startIndex * (DOT_SIZE + DOT_SPACING),
        useNativeDriver: true,
        friction: 10,
        tension: 40
      }).start()
    }
  }

  const goToImage = (index: number, property: Property) => {
    if (!property || !imageScrollRef.current) return

    const validIndex = Math.max(0, Math.min(index, property.images.length - 1))
    setCurrentIndex(validIndex)
    imageScrollRef.current.scrollTo({ x: validIndex * width, animated: true })
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchProperties()
    setRefreshing(false)
  }

  const handleApplyFilters = () => {
    fetchProperties().then(() => {
      setShowFilters(false)
    })
  }

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('light-content', true)
      if (Platform.OS === 'web') document.title = 'Home'
      fetchProperties()
    }, [filters])
  )

  const toggleDescription = (id: string) => {
    setExpandedDescriptions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  return (
    <View className={`flex-1 bg-black ${refreshing ? 'pt-10' : ''}`}>
      <View style={{ position: 'absolute', top: 45, left: 0, zIndex: 20 }}>
        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          className="px-4 py-2 rounded-2xl flex-row items-center space-x-2 self-start mx-2 shadow-sm">
          <Text className="text-white text-2xl font-bold">
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Text>
          <Ionicons name={showFilters ? 'chevron-up' : 'chevron-down'} size={20} color="white" />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <ScrollView
          className="bg-white/60 p-4 pb-6 rounded-2xl m-4"
          style={{
            position: 'absolute',
            top: 85,
            left: 10,
            right: 10,
            zIndex: 10
          }}>
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
                setFilters((prev) => ({ ...prev, operation: value }))
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
                {propertyTypes.map((type) => {
                  const isSelected = filters.type.includes(type)
                  return (
                    <TouchableOpacity
                      key={type}
                      onPress={() => {
                        setFilters((prev) => {
                          const newTypes = isSelected
                            ? prev.type.filter((t) => t !== type)
                            : [...prev.type, type]
                          return { ...prev, type: newTypes }
                        })
                      }}
                      className="flex-row items-center mb-2">
                      <Ionicons
                        name={isSelected ? 'checkbox' : 'square-outline'}
                        size={20}
                        style={{ marginRight: 8 }}
                      />
                      <Text className="capitalize">{type}</Text>
                    </TouchableOpacity>
                  )
                })}
              </ScrollView>
            </View>
          )}

          <Pressable
            onPress={() => setShowProvinceFilter(!showProvinceFilter)}
            className="flex-row items-center pb-2">
            <Text className="text-lg">Province</Text>
            <Ionicons name={showProvinceFilter ? 'chevron-up' : 'chevron-down'} size={20} />
          </Pressable>

          {showProvinceFilter && (
            <View style={{ maxHeight: 176 }}>
              <ScrollView>
                {provincesOfSpain.map(({ label, value }) => {
                  const isSelected = filters.province.includes(value)
                  return (
                    <TouchableOpacity
                      key={value}
                      onPress={() => {
                        setFilters((prev) => {
                          const newProvince = isSelected
                            ? prev.province.filter((t) => t !== value)
                            : [...prev.province, value]
                          return { ...prev, province: newProvince }
                        })
                      }}
                      className="flex-row items-center mb-2">
                      <Ionicons
                        name={isSelected ? 'checkbox' : 'square-outline'}
                        size={20}
                        style={{ marginRight: 8 }}
                      />
                      <Text className="capitalize">{label}</Text>
                    </TouchableOpacity>
                  )
                })}
              </ScrollView>
            </View>
          )}

          <TouchableOpacity onPress={handleApplyFilters} className="bg-darkBlue p-3 rounded-2xl">
            <Text className="text-white text-center font-bold">Apply Filters</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {properties.length === 0 && !refreshing && (
        <View className="flex-1 justify-center items-center">
          <Text className="text-white text-xl">No properties found with current filters.</Text>
        </View>
      )}

      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FFFFFF']}
            tintColor="#FFFFFF"
          />
        }
        renderItem={({ item }) => {
          const isExpanded = expandedDescriptions.includes(item.id)
          const maxLength = 70
          const description = item.description

          return (
            <View style={{ height }}>
              <View className="h-full w-full bg-black justify-end">
                <View>
                  {item.images && item.images.length > 0 ? (
                    <View>
                      {Platform.OS === 'web' ? (
                        <ScrollView
                          ref={imageScrollRef}
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          scrollEventThrottle={16}
                          onScroll={Animated.event(
                            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                            {
                              useNativeDriver: false,
                              listener: (event: any) => onScroll(event, item)
                            }
                          )}
                          onMomentumScrollEnd={(event) => {
                            const offsetX = event.nativeEvent.contentOffset.x
                            const pageIndex = Math.round(offsetX / width)
                            imageScrollRef.current?.scrollTo({
                              x: pageIndex * width,
                              animated: true
                            })
                          }}
                          contentContainerStyle={{ alignItems: 'center' }}>
                          {item.images.map((item) => (
                            <View key={item.id} style={{ width: width, height: height }}>
                              <Image
                                source={{ uri: item.url }}
                                style={{
                                  width: width,
                                  height: height,
                                  resizeMode: 'contain'
                                }}
                              />
                            </View>
                          ))}
                        </ScrollView>
                      ) : (
                        <ScrollView
                          ref={imageScrollRef}
                          horizontal
                          pagingEnabled
                          showsHorizontalScrollIndicator={false}
                          scrollEventThrottle={16}
                          onScroll={Animated.event(
                            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                            {
                              useNativeDriver: false,
                              listener: (event: any) => onScroll(event, item)
                            }
                          )}>
                          {item.images.map((item) => (
                            <Image
                              key={item.id}
                              source={{ uri: item.url }}
                              style={{ width: width, height: height, resizeMode: 'contain' }}
                            />
                          ))}
                        </ScrollView>
                      )}

                      {Platform.OS === 'web' ? (
                        <View className="flex-row justify-center items-center mt-2 space-x-2">
                          <TouchableOpacity
                            className="bg-[#353949] px-3 py-1 rounded-lg disabled:opacity-50"
                            disabled={currentIndex === 0}
                            onPress={() => goToImage(currentIndex - 1, item)}>
                            <Ionicons name="chevron-back" size={16} color="white" />
                          </TouchableOpacity>

                          <View
                            className="overflow-hidden justify-center align-middle bg-black/50 rounded-full"
                            style={{
                              height: DOT_SIZE * 3,
                              width:
                                item.images.length < VISIBLE_DOTS
                                  ? item.images.length * (DOT_SIZE + DOT_SPACING)
                                  : DOT_CONTAINER_WIDTH
                            }}>
                            <Animated.View
                              style={{
                                flexDirection: 'row',
                                transform: [
                                  {
                                    translateX: dotsScrollX.interpolate({
                                      inputRange: [
                                        0,
                                        item.images.length * (DOT_SIZE + DOT_SPACING)
                                      ],
                                      outputRange: [
                                        0,
                                        -item.images.length * (DOT_SIZE + DOT_SPACING)
                                      ],
                                      extrapolate: 'clamp'
                                    })
                                  }
                                ]
                              }}>
                              {item.images.map((_, index) => {
                                const inputRange = [
                                  (index - 1) * width,
                                  index * width,
                                  (index + 1) * width
                                ]
                                const scaleAnim = scrollX.interpolate({
                                  inputRange,
                                  outputRange: [0.5, 0.8, 0.5],
                                  extrapolate: 'clamp'
                                })
                                const colorAnim = scrollX.interpolate({
                                  inputRange,
                                  outputRange: ['#bbb', '#fff', '#bbb'],
                                  extrapolate: 'clamp'
                                })

                                return (
                                  <Animated.View
                                    key={index}
                                    style={{
                                      height: DOT_SIZE,
                                      width: DOT_SIZE,
                                      borderRadius: DOT_SIZE / 2,
                                      backgroundColor: colorAnim,
                                      marginHorizontal: DOT_SPACING / 2,
                                      transform: [{ scale: scaleAnim }]
                                    }}
                                  />
                                )
                              })}
                            </Animated.View>
                          </View>

                          <TouchableOpacity
                            className="bg-[#353949] px-3 py-1 rounded-lg disabled:opacity-50"
                            disabled={currentIndex === item.images.length - 1}
                            onPress={() => goToImage(currentIndex + 1, item)}>
                            <Ionicons name="chevron-forward" size={16} color="white" />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View
                          className="overflow-hidden justify-center align-middle absolute mt-2 mb-3 bg-black/50 bottom-64 rounded-full"
                          style={{
                            height: DOT_SIZE * 3,
                            width:
                              item.images.length < VISIBLE_DOTS
                                ? item.images.length * (DOT_SIZE + DOT_SPACING)
                                : DOT_CONTAINER_WIDTH,
                            left:
                              item.images.length < VISIBLE_DOTS
                                ? (width - item.images.length * (DOT_SIZE + DOT_SPACING)) / 2
                                : (width - DOT_CONTAINER_WIDTH) / 2
                          }}>
                          <Animated.View
                            style={{
                              flexDirection: 'row',
                              transform: [
                                {
                                  translateX: dotsScrollX.interpolate({
                                    inputRange: [0, item.images.length * (DOT_SIZE + DOT_SPACING)],
                                    outputRange: [
                                      0,
                                      -item.images.length * (DOT_SIZE + DOT_SPACING)
                                    ],
                                    extrapolate: 'clamp'
                                  })
                                }
                              ]
                            }}>
                            {item.images.map((_, index) => {
                              const inputRange = [
                                (index - 1) * width,
                                index * width,
                                (index + 1) * width
                              ]
                              const scaleAnim = scrollX.interpolate({
                                inputRange,
                                outputRange: [0.5, 0.8, 0.5],
                                extrapolate: 'clamp'
                              })
                              const colorAnim = scrollX.interpolate({
                                inputRange,
                                outputRange: ['#bbb', '#fff', '#bbb'],
                                extrapolate: 'clamp'
                              })

                              return (
                                <Animated.View
                                  key={index}
                                  style={{
                                    height: DOT_SIZE,
                                    width: DOT_SIZE,
                                    borderRadius: DOT_SIZE / 2,
                                    backgroundColor: colorAnim,
                                    marginHorizontal: DOT_SPACING / 2,
                                    transform: [{ scale: scaleAnim }]
                                  }}
                                />
                              )
                            })}
                          </Animated.View>
                        </View>
                      )}
                    </View>
                  ) : (
                    <View className="justify-center items-center">
                      <Image
                        source={require('@/assets/images/NotAvalibleImg3.png')}
                        style={{
                          width: width,
                          height: height,
                          resizeMode: 'contain'
                        }}
                      />
                    </View>
                  )}
                </View>

                <View className={`absolute p-5 pb-24 ${isExpanded ? 'bg-black/40' : ''}`}>
                  <Text className="text-white text-2xl font-semibold capitalize">
                    {item.type}
                    <Text className="normal-case">
                      {item.operation === 'sell' ? ' for sale' : ' for rent'}
                    </Text>
                  </Text>

                  <Text className="text-white mt-1 text-base capitalize">
                    {item.street} {item.street_number}, {item.locality}
                  </Text>

                  <View className="flex-row flex-wrap gap-4">
                    <View className="flex-row items-center gap-1">
                      <Text className="text-white text-base">
                        €{item.price.toLocaleString()}
                        {item.operation === 'sell' ? '' : ' / month'}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="resize-outline" size={18} color="white" />
                      <Text className="text-white">{item.size} m²</Text>
                    </View>
                  </View>

                  <Text className="text-white mt-1 text-lg font-bold">
                    {isExpanded
                      ? description
                      : description.length > maxLength
                        ? description.slice(0, maxLength) + '...'
                        : description}
                  </Text>

                  {description.length > maxLength && (
                    <TouchableOpacity onPress={() => toggleDescription(item.id)}>
                      <Text className="text-blue-400 mt-1 font-semibold">
                        {isExpanded ? 'Show less' : 'Show more'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          )
        }}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        decelerationRate="fast"
      />
    </View>
  )
}

export default HomePage
