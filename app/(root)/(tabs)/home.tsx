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
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'

import { INSTARENT_API_KEY, INSTARENT_API_URL } from '@/utils/constants'
import { Property } from '@/utils/types'
import Ionicons from '@expo/vector-icons/build/Ionicons'
import { Picker } from '@react-native-picker/picker'

import '@/global.css'
import {
  buildingFeaturesOptions,
  interiorFeaturesOptions,
  outdoorFeaturesOptions,
  parkingTransportOptions,
  propertyTypes,
  provincesOfSpain
} from '@/utils/optionsData'

const { height, width } = Dimensions.get('window')

const VISIBLE_DOTS = 5
const DOT_SIZE = 8
const DOT_SPACING = 4
const DOT_CONTAINER_WIDTH = VISIBLE_DOTS * (DOT_SIZE + DOT_SPACING)

const HomePage = () => {
  const [properties, setProperties] = useState<Property[]>([])
  const [expandedDescriptions, setExpandedDescriptions] = useState<string[]>([])

  const imageScrollRef = useRef<ScrollView>(null)
  const [currentIndexes, setCurrentIndexes] = useState<{ [key: string]: number }>({})
  const imageScrollRefs = useRef<{ [key: string]: ScrollView | null }>({})
  const scrollXRefs = useRef<{ [key: string]: Animated.Value }>({})
  const dotsScrollXRefs = useRef<{ [key: string]: Animated.Value }>({})

  const [refreshing, setRefreshing] = useState(false)

  const [filters, setFilters] = useState({
    operation: '',
    type: [] as string[],
    province: [] as string[],
    features: [] as string[],
    locality: ''
  })

  const [showFilters, setShowFilters] = useState(false)
  const [showOperationFilter, setShowOperationFilter] = useState(false)
  const [showTypesFilter, setShowTypesFilter] = useState(false)
  const [showProvinceFilter, setShowProvinceFilter] = useState(false)
  const [showLocalityFilter, setShowLocalityFilter] = useState(false)
  const [showFeaturesFilter, setShowFeaturesFilter] = useState(false)

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

    setCurrentIndexes((prev) => ({
      ...prev,
      [property.id]: index
    }))

    if (property?.images?.length) {
      const startIndex = Math.max(
        0,
        Math.min(index - Math.floor(VISIBLE_DOTS / 2), property.images.length - VISIBLE_DOTS)
      )

      if (!dotsScrollXRefs.current[property.id]) {
        dotsScrollXRefs.current[property.id] = new Animated.Value(0)
      }

      Animated.spring(dotsScrollXRefs.current[property.id], {
        toValue: startIndex * (DOT_SIZE + DOT_SPACING),
        useNativeDriver: true,
        friction: 10,
        tension: 40
      }).start()
    }
  }

  const goToImage = (index: number, property: Property) => {
    const scrollRef = imageScrollRefs.current[property.id]
    if (!property || !scrollRef) return

    const validIndex = Math.max(0, Math.min(index, property.images.length - 1))
    setCurrentIndexes((prev) => ({
      ...prev,
      [property.id]: validIndex
    }))

    if (Platform.OS === 'web') {
      scrollRef.scrollTo({ x: validIndex * width, animated: true })
    } else {
      scrollRef.scrollTo({ x: validIndex * width, animated: true })
    }
  }

  const initializeScrollValues = (property: Property) => {
    if (!scrollXRefs.current[property.id]) {
      scrollXRefs.current[property.id] = new Animated.Value(0)
    }
    if (!dotsScrollXRefs.current[property.id]) {
      dotsScrollXRefs.current[property.id] = new Animated.Value(0)
    }
  }

  const getScrollX = (propertyId: string) => {
    if (!scrollXRefs.current[propertyId]) {
      scrollXRefs.current[propertyId] = new Animated.Value(0)
    }
    return scrollXRefs.current[propertyId]
  }

  const getDotsScrollX = (propertyId: string) => {
    if (!dotsScrollXRefs.current[propertyId]) {
      dotsScrollXRefs.current[propertyId] = new Animated.Value(0)
    }
    return dotsScrollXRefs.current[propertyId]
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
                <View className="flex-row flex-wrap gap-2">
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
                        className={`border rounded-2xl px-4 py-2 shadow-sm ${
                          isSelected ? 'bg-darkBlue border-darkBlue' : 'bg-white  border-darkBlue'
                        }`}>
                        <Text className={`capitalize ${isSelected ? 'text-white' : ''}`}>
                          {type}
                        </Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>
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
                <View className="flex-row flex-wrap gap-2">
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
          )}

          <Pressable
            onPress={() => setShowLocalityFilter(!showLocalityFilter)}
            className="flex-row items-center pb-2">
            <Text className="text-lg">Locality</Text>
            <Ionicons name={showLocalityFilter ? 'chevron-up' : 'chevron-down'} size={20} />
          </Pressable>

          {showLocalityFilter && (
            <TextInput
              className="mb-2 px-4 py-2 border border-gray-300 rounded-2xl bg-gray-100 text-base capitalize"
              placeholder="Enter your locality"
              placeholderTextColor="#999"
              onChangeText={(value: string) => setFilters((prev) => ({ ...prev, locality: value }))}
            />
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
                          setFilters((prev) => {
                            const newFeature = isSelected
                              ? prev.features.filter((t) => t !== value)
                              : [...prev.features, value]
                            return { ...prev, features: newFeature }
                          })
                        }}
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

              <Text className="mb-2 text-lg">Building Features</Text>
              <ScrollView>
                <View className="flex-row flex-wrap gap-2 mb-2">
                  {buildingFeaturesOptions.map(({ label, value }) => {
                    const isSelected = filters.features.includes(value)
                    return (
                      <TouchableOpacity
                        key={value}
                        onPress={() => {
                          setFilters((prev) => {
                            const newFeature = isSelected
                              ? prev.features.filter((t) => t !== value)
                              : [...prev.features, value]
                            return { ...prev, features: newFeature }
                          })
                        }}
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

              <Text className="mb-2 text-lg">Outdoor Features</Text>
              <ScrollView>
                <View className="flex-row flex-wrap gap-2 mb-2">
                  {outdoorFeaturesOptions.map(({ label, value }) => {
                    const isSelected = filters.features.includes(value)
                    return (
                      <TouchableOpacity
                        key={value}
                        onPress={() => {
                          setFilters((prev) => {
                            const newFeature = isSelected
                              ? prev.features.filter((t) => t !== value)
                              : [...prev.features, value]
                            return { ...prev, features: newFeature }
                          })
                        }}
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

              <Text className="mb-2 text-lg">Parking & Transport</Text>
              <ScrollView>
                <View className="flex-row flex-wrap gap-2 mb-2">
                  {parkingTransportOptions.map(({ label, value }) => {
                    const isSelected = filters.features.includes(value)
                    return (
                      <TouchableOpacity
                        key={value}
                        onPress={() => {
                          setFilters((prev) => {
                            const newFeature = isSelected
                              ? prev.features.filter((t) => t !== value)
                              : [...prev.features, value]
                            return { ...prev, features: newFeature }
                          })
                        }}
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
            </ScrollView>
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
                          ref={(ref) => {
                            imageScrollRefs.current[item.id] = ref
                            initializeScrollValues(item)
                          }}
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          scrollEventThrottle={16}
                          onScroll={Animated.event(
                            [{ nativeEvent: { contentOffset: { x: getScrollX(item.id) } } }],
                            {
                              useNativeDriver: false,
                              listener: (event: any) => onScroll(event, item)
                            }
                          )}
                          onMomentumScrollEnd={(event) => {
                            const offsetX = event.nativeEvent.contentOffset.x
                            const pageIndex = Math.round(offsetX / width)

                            setCurrentIndexes((prev) => ({
                              ...prev,
                              [item.id]: pageIndex
                            }))
                          }}
                          contentContainerStyle={{ alignItems: 'center' }}>
                          {item.images.map((img) => (
                            <View key={img.id} style={{ width: width, height: height }}>
                              <Image
                                source={{ uri: img.url }}
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
                            [{ nativeEvent: { contentOffset: { x: getScrollX(item.id) } } }],
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
                        <View className="flex-row justify-center absolute items-center mt-2 mb-3 bottom-60 left-5 space-x-2">
                          <TouchableOpacity
                            className="bg-[#353949] px-3 py-1 rounded-lg disabled:opacity-50"
                            disabled={currentIndexes[item.id] === 0}
                            onPress={() => goToImage((currentIndexes[item.id] || 0) - 1, item)}>
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
                                    translateX: getDotsScrollX(item.id).interpolate({
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
                                const scaleAnim = getScrollX(item.id).interpolate({
                                  inputRange,
                                  outputRange: [0.5, 0.8, 0.5],
                                  extrapolate: 'clamp'
                                })
                                const colorAnim = getScrollX(item.id).interpolate({
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
                            disabled={currentIndexes[item.id] === item.images.length - 1}
                            onPress={() => goToImage((currentIndexes[item.id] || 0) + 1, item)}>
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
                                  translateX: getDotsScrollX(item.id).interpolate({
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
                              const scaleAnim = getScrollX(item.id).interpolate({
                                inputRange,
                                outputRange: [0.5, 0.8, 0.5],
                                extrapolate: 'clamp'
                              })
                              const colorAnim = getScrollX(item.id).interpolate({
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
