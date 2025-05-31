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

import * as Location from 'expo-location'
import { router, useFocusEffect } from 'expo-router'

import Slider from '@react-native-community/slider'
import { Picker } from '@react-native-picker/picker'

import Ionicons from '@expo/vector-icons/build/Ionicons'

import { GOOGLE_MAPS_API_KEY, INSTARENT_API_KEY, INSTARENT_API_URL } from '@/utils/constants'
import {
  buildingFeaturesOptions,
  departmentsOfFrance,
  interiorFeaturesOptions,
  outdoorFeaturesOptions,
  parkingTransportOptions,
  propertyTypes,
  provincesOfSpain,
  suportCountries
} from '@/utils/optionsData'

import '@/global.css'

const VISIBLE_DOTS = 5
const DOT_SIZE = 8
const DOT_SPACING = 4
const DOT_CONTAINER_WIDTH = VISIBLE_DOTS * (DOT_SIZE + DOT_SPACING)

const { height, width } = Dimensions.get('window')

interface PropertyImage {
  id: string
  url: string
}

interface Property {
  id: string
  title: string
  description: string
  price: number
  operation: 'rent' | 'sell'
  type: string
  features: string[]
  images: PropertyImage[]
  street: string
  street_number: string
  locality: string
  size: number
}

interface PropertyCardProps {
  item: Property
  isExpanded: boolean
  onToggleDescription: () => void
  onViewProperty: () => void
}

const PropertyCard = React.memo<PropertyCardProps>(
  ({ item, isExpanded, onToggleDescription, onViewProperty }) => {
    const scrollXRefs = useRef<{ [key: string]: Animated.Value }>({})
    const dotsScrollXRefs = useRef<{ [key: string]: Animated.Value }>({})
    const imageScrollRefs = useRef<{ [key: string]: ScrollView | null }>({})
    const [currentIndexes, setCurrentIndexes] = useState<{ [key: string]: number }>({})

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

    const initializeScrollValues = (property: Property) => {
      if (!scrollXRefs.current[property.id]) {
        scrollXRefs.current[property.id] = new Animated.Value(0)
      }
      if (!dotsScrollXRefs.current[property.id]) {
        dotsScrollXRefs.current[property.id] = new Animated.Value(0)
      }
    }

    const onScroll = (event: any, property: Property) => {
      const offsetX = event.nativeEvent.contentOffset.x
      const index = Math.round(offsetX / width)

      setCurrentIndexes((prev: { [key: string]: number }) => ({
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

    const scrollX = getScrollX(item.id)
    const dotsScrollX = getDotsScrollX(item.id)
    const maxLength = 70
    const description = isExpanded
      ? item.description
      : item.description.length > maxLength
        ? item.description.slice(0, maxLength) + '...'
        : item.description

    const formatPrice = (value: number) => {
      if (item.operation === 'rent') {
        return `€${value.toLocaleString()}/month`
      }
      return `€${value.toLocaleString()}`
    }

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
                    {item.images.map((img: PropertyImage) => (
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
                  <View>
                    <ScrollView
                      ref={(ref) => {
                        imageScrollRefs.current[item.id] = ref
                        initializeScrollValues(item)
                      }}
                      horizontal
                      pagingEnabled
                      showsHorizontalScrollIndicator={false}
                      scrollEventThrottle={16}
                      bounces={true}
                      onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: getScrollX(item.id) } } }],
                        {
                          useNativeDriver: false,
                          listener: (event: any) => {
                            const offsetX = event.nativeEvent.contentOffset.x
                            const index = Math.floor(offsetX / width)
                            const maxIndex = item.images.length - 1
                            const lastPageOffset = maxIndex * width
                            const overscrollThreshold = 30

                            if (index >= maxIndex) {
                              const overscroll = offsetX - lastPageOffset
                              if (overscroll > overscrollThreshold) {
                                onViewProperty()
                                return
                              }
                            }

                            onScroll(event, item)
                          }
                        }
                      )}>
                      {item.images.map((img: PropertyImage) => (
                        <Image
                          key={img.id}
                          source={{ uri: img.url }}
                          style={{
                            width: width,
                            height: height,
                            resizeMode: 'contain'
                          }}
                        />
                      ))}
                    </ScrollView>
                  </View>
                )}

                {Platform.OS === 'web' ? (
                  <View className="flex-row justify-center absolute items-center mt-2 mb-3 bottom-64 left-5 space-x-2">
                    <TouchableOpacity
                      className="bg-darkBlue px-3 py-1 rounded-lg disabled:opacity-50"
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
                                inputRange: [0, item.images.length * (DOT_SIZE + DOT_SPACING)],
                                outputRange: [0, -item.images.length * (DOT_SIZE + DOT_SPACING)],
                                extrapolate: 'clamp'
                              })
                            }
                          ]
                        }}>
                        {item.images.map((_: PropertyImage, index: number) => {
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
                      className="bg-darkBlue px-3 py-1 rounded-lg disabled:opacity-50"
                      disabled={currentIndexes[item.id] === item.images.length - 1}
                      onPress={() => goToImage((currentIndexes[item.id] || 0) + 1, item)}>
                      <Ionicons name="chevron-forward" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View
                    className="overflow-hidden justify-center align-middle absolute mt-2 mb-3 bg-black/50 bottom-72 rounded-full"
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
                              outputRange: [0, -item.images.length * (DOT_SIZE + DOT_SPACING)],
                              extrapolate: 'clamp'
                            })
                          }
                        ]
                      }}>
                      {item.images.map((_: PropertyImage, index: number) => {
                        const inputRange = [(index - 1) * width, index * width, (index + 1) * width]
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
              <View>
                <ScrollView
                  ref={(ref) => {
                    imageScrollRefs.current[item.id] = ref
                    initializeScrollValues(item)
                  }}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  scrollEventThrottle={16}
                  bounces={true}
                  onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: getScrollX(item.id) } } }],
                    {
                      useNativeDriver: false,
                      listener: (event: any) => {
                        const offsetX = event.nativeEvent.contentOffset.x
                        if (offsetX > 30) {
                          onViewProperty()
                        }
                      }
                    }
                  )}>
                  <Image
                    source={require('@/assets/images/NotAvalibleImg.png')}
                    style={{
                      width: width,
                      height: height,
                      resizeMode: 'contain'
                    }}
                  />
                </ScrollView>
              </View>
            )}
          </View>

          <View className="absolute bottom-24 left-0 right-0">
            <ScrollView
              className={`px-5 pt-5 ${isExpanded ? 'bg-black/40' : ''}`}
              style={{
                maxHeight: isExpanded ? height * 0.6 : 'auto'
              }}
              scrollEnabled={isExpanded}
              nestedScrollEnabled={true}
              onTouchStart={(e) => {
                e.stopPropagation()
              }}
              onTouchMove={(e) => {
                e.stopPropagation()
              }}>
              <TouchableOpacity activeOpacity={0.8} onPress={onViewProperty}>
                <Text className="text-white text-2xl font-semibold capitalize">
                  {item.type}
                  <Text className="normal-case">
                    {item.operation === 'sell' ? ' for sale' : ' for rent'}
                  </Text>
                </Text>
              </TouchableOpacity>

              <Text className="text-white mt-1 text-base capitalize">
                {item.street} {item.street_number}, {item.locality}
              </Text>

              <View className="flex-row flex-wrap gap-4">
                <View className="flex-row items-center gap-1">
                  <Text className="text-white text-base">{formatPrice(item.price)}</Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Ionicons name="resize-outline" size={18} color="white" />
                  <Text className="text-white">{item.size} m²</Text>
                </View>
              </View>

              <Text className="text-white mt-1 text-lg font-bold">{description}</Text>

              {item.description.length > maxLength && (
                <TouchableOpacity onPress={onToggleDescription}>
                  <Text className="text-blue-400 mt-1 font-semibold">
                    {isExpanded ? 'Show less' : 'Show more'}
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </View>
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.item.id === nextProps.item.id &&
      prevProps.isExpanded === nextProps.isExpanded &&
      prevProps.item.description === nextProps.item.description
    )
  }
)

const HomePage = () => {
  const [properties, setProperties] = useState<Property[]>([])
  const [expandedDescriptions, setExpandedDescriptions] = useState<string[]>([])
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(
    null
  )
  const [currentAddress, setCurrentAddress] = useState<string>('')
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const lastGeocodeTime = useRef<number>(0)
  const GEOCODE_COOLDOWN = 2000
  const lastNavigationTime = useRef<number>(0)
  const NAVIGATION_COOLDOWN = 1000

  const [currentIndexes, setCurrentIndexes] = useState<{ [key: string]: number }>({})
  const imageScrollRefs = useRef<{ [key: string]: ScrollView | null }>({})
  const scrollXRefs = useRef<{ [key: string]: Animated.Value }>({})
  const dotsScrollXRefs = useRef<{ [key: string]: Animated.Value }>({})

  const [refreshing, setRefreshing] = useState(false)

  const [filters, setFilters] = useState({
    operation: '',
    type: [] as string[],
    features: [] as string[],
    province: [] as string[],
    country: [] as string[],
    locality: '',
    minSize: '',
    maxSize: '',
    minPrice: '',
    maxPrice: ''
  })

  const [showFilters, setShowFilters] = useState(false)
  const [showOperationFilter, setShowOperationFilter] = useState(false)
  const [showTypesFilter, setShowTypesFilter] = useState(false)
  const [showProvinceFilter, setShowProvinceFilter] = useState(false)
  const [showLocalityFilter, setShowLocalityFilter] = useState(false)
  const [showFeaturesFilter, setShowFeaturesFilter] = useState(false)
  const [showLocationFilters, setShowLocationFilters] = useState(false)
  const [showCountryFilters, setShowCountryFilters] = useState(false)
  const [showSizeFilter, setShowSizeFilter] = useState(false)
  const [showPriceFilter, setShowPriceFilter] = useState(false)

  const [priceRange, setPriceRange] = useState({
    min: 0,
    max: 9999999
  })

  const MAX_DISPLAY_LENGTH = 30

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

  const fetchProperties = async () => {
    try {
      const queryParams = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => queryParams.append(key, v))
        } else if (value !== '') {
          if (key === 'minSize' || key === 'maxSize') {
            queryParams.append(key, value)
          } else {
            queryParams.append(key, value)
          }
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
      setProperties([])
    }
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

  const clearGeneralFilters = () => {
    setFilters((prev) => ({
      ...prev,
      operation: '',
      type: [],
      features: [],
      minSize: '',
      maxSize: '',
      minPrice: '',
      maxPrice: ''
    }))
    setPriceRange({
      min: 0,
      max: 9999999
    })
    fetchProperties()
  }

  const clearLocationFilters = () => {
    setFilters((prev) => ({
      ...prev,
      province: [],
      country: [],
      locality: ''
    }))
    setCurrentAddress('')
    fetchProperties()
  }

  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true)
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        console.log('Permission to access location was denied')
        return
      }

      const location = await Location.getCurrentPositionAsync({})
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      })

      const now = Date.now()
      if (now - lastGeocodeTime.current < GEOCODE_COOLDOWN) {
        console.log('Skipping geocode due to rate limit')
        return
      }

      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.coords.latitude},${location.coords.longitude}&key=${GOOGLE_MAPS_API_KEY}&language=en`
        )
        const data = await response.json()

        if (data.results && data.results.length > 0) {
          const result = data.results[0]
          let province = ''
          let country = ''

          for (const component of result.address_components) {
            if (component.types.includes('administrative_area_level_2')) {
              province = component.long_name.toLowerCase()
            }
            if (component.types.includes('country')) {
              country = component.long_name.toLowerCase()
            }
          }

          if (province) {
            setCurrentAddress(province)
            setFilters((prev) => ({
              ...prev,
              province: [province],
              country: country ? [country] : prev.country
            }))
          } else if (country) {
            setCurrentAddress(country)
            setFilters((prev) => ({
              ...prev,
              province: [],
              country: [country]
            }))
          } else {
            setCurrentAddress('Location not found')
          }
          lastGeocodeTime.current = now
        } else {
          setCurrentAddress('Location not found')
        }
      } catch (geocodeError) {
        console.log('Geocoding error:', geocodeError)
        setCurrentAddress('Current Location')
      }
    } catch (error) {
      console.error('Error getting location:', error)
    } finally {
      setIsLoadingLocation(false)
    }
  }

  const updateSelectedProvince = (value: string, isSelected: boolean) => {
    setFilters((prev) => {
      const newProvince = isSelected
        ? prev.province.filter((t) => t !== value)
        : [...prev.province, value]
      return { ...prev, province: newProvince }
    })

    setFilters((prev) => {
      const selectedProvinces = prev.province
        .map((p) => {
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
    setFilters((prev) => {
      const newCountry = isSelected
        ? prev.country.filter((t) => t !== value)
        : [...prev.country, value]

      if (isSelected) {
        const provincesToKeep = prev.province.filter((province) => {
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

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('light-content', true)
      if (Platform.OS === 'web') document.title = 'Home'

      if (!userLocation) {
        getCurrentLocation()
      }
      fetchProperties()
    }, [filters])
  )

  const toggleDescription = (id: string) => {
    setExpandedDescriptions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  React.useEffect(() => {
    const maxPrice = getMaxPrice()
    setPriceRange((prev) => ({
      min: Math.min(prev.min, maxPrice),
      max: Math.min(prev.max, maxPrice)
    }))
  }, [filters.operation])

  const handleViewProperty = (propertyId: string) => {
    const now = Date.now()
    if (now - lastNavigationTime.current < NAVIGATION_COOLDOWN) {
      return
    }
    lastNavigationTime.current = now

    router.push({
      pathname: '/(root)/(properties)/propertyView',
      params: {
        propertyId
      }
    })
  }

  const renderItem = useCallback(
    ({ item }: { item: Property }) => {
      const isExpanded = expandedDescriptions.includes(item.id)
      return (
        <PropertyCard
          item={item}
          isExpanded={isExpanded}
          onToggleDescription={() => toggleDescription(item.id)}
          onViewProperty={() => handleViewProperty(item.id)}
        />
      )
    },
    [expandedDescriptions]
  )

  return (
    <View className={`flex-1 bg-black ${refreshing ? 'pt-10' : ''}`}>
      <View style={{ position: 'absolute', top: 45, left: 0, zIndex: 20 }}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            setShowFilters(!showFilters)
            if (!showFilters) setShowLocationFilters(false)
          }}
          className="px-4 py-2 rounded-2xl flex-row items-center space-x-2 self-start mx-2 shadow-sm">
          <Text className="text-white text-2xl font-bold">
            {showFilters ? 'Filters' : 'Filters'}
          </Text>
          <Ionicons name={showFilters ? 'chevron-up' : 'chevron-down'} size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View style={{ position: 'absolute', top: 45, right: 10, zIndex: 20 }}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            setShowLocationFilters(!showLocationFilters)
            if (!showLocationFilters) setShowFilters(false)
          }}
          className="px-3 py-2 rounded-2xl flex-row items-center space-x-2 bg-white/80">
          <Ionicons name="location-sharp" size={20} color="black" />
          <Text className="text-black text-base capitalize">
            {currentAddress ||
              (filters.country.length > 0
                ? (() => {
                    const countries = filters.country.map(
                      (c) => c.charAt(0).toUpperCase() + c.slice(1)
                    )
                    let displayText = countries.join(', ')
                    if (displayText.length > MAX_DISPLAY_LENGTH) {
                      displayText = displayText.substring(0, MAX_DISPLAY_LENGTH) + '...'
                    }
                    return displayText
                  })()
                : 'No location selected')}
          </Text>
        </TouchableOpacity>
      </View>

      {showLocationFilters && (
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
                        <Text className="text-lg font-semibold mb-2 capitalize">
                          {countryLabel}
                        </Text>
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
                  setFilters((prev) => ({ ...prev, locality: value }))
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
              setShowLocationFilters(false)
            }}
            className="bg-darkBlue p-3 rounded-2xl mt-2">
            <Text className="text-white text-center font-bold">Apply Location Filters</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {showFilters && (
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
            <TouchableOpacity
              onPress={clearGeneralFilters}
              className="bg-red-500 px-4 py-2 rounded-xl">
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
                  onChangeText={(value) => setFilters((prev) => ({ ...prev, minSize: value }))}
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm mb-1">Max Size</Text>
                <TextInput
                  className="px-4 py-2 border border-gray-300 rounded-2xl bg-gray-100 text-base"
                  placeholder="Max size"
                  keyboardType="numeric"
                  value={filters.maxSize}
                  onChangeText={(value) => setFilters((prev) => ({ ...prev, maxSize: value }))}
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
                    setPriceRange((prev) => ({
                      ...prev,
                      min: Math.min(value, prev.max - getStepSize())
                    }))
                    setFilters((prev) => ({
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
                    setPriceRange((prev) => ({
                      ...prev,
                      max: Math.max(value, prev.min + getStepSize())
                    }))
                    setFilters((prev) => ({
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
      )}

      {properties.length === 0 && !refreshing && (
        <View className="flex-1 justify-center items-center">
          <Text className="text-white text-xl">No properties found with current filters.</Text>
        </View>
      )}

      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FFFFFF']}
            tintColor="#FFFFFF"
          />
        }
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        decelerationRate="fast"
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        windowSize={3}
        initialNumToRender={2}
      />
    </View>
  )
}

export default React.memo(HomePage)
