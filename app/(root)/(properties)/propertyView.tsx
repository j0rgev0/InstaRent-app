import { INSTARENT_API_KEY, INSTARENT_API_URL } from '@/utils/constants'
import { Property } from '@/utils/types'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router'
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions
} from 'react-native'

// @ts-ignore
import MapPreview from '@/components/map/MapPreview'

const VISIBLE_DOTS = 5
const DOT_SIZE = 8
const DOT_SPACING = 4
const DOT_CONTAINER_WIDTH = VISIBLE_DOTS * (DOT_SIZE + DOT_SPACING)

const screenWidth = Dimensions.get('window').width

const PropertyView = () => {
  const navigation = useNavigation()
  const params = useLocalSearchParams()
  const { width } = useWindowDimensions()

  const propertyId = params.propertyId as string | undefined
  const [property, setProperty] = useState<Property | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const imageScrollRef = useRef<ScrollView>(null)

  const scrollX = useRef(new Animated.Value(0)).current
  const dotsScrollX = useRef(new Animated.Value(0)).current

  const fetchProperty = async () => {
    if (!propertyId) return
    try {
      const response = await fetch(`${INSTARENT_API_URL}/properties/${propertyId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${INSTARENT_API_KEY}`
        }
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Error getting property')

      setProperty(data)
      setCurrentIndex(0)
      dotsScrollX.setValue(0)
    } catch (error) {
      console.error('Error getting property', error)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchProperty()
    setRefreshing(false)
  }

  const onScroll = (event: any) => {
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

  const goToImage = (index: number) => {
    if (!property || !imageScrollRef.current) return

    const validIndex = Math.max(0, Math.min(index, property.images.length - 1))
    setCurrentIndex(validIndex)
    imageScrollRef.current.scrollTo({ x: validIndex * width, animated: true })
  }

  useEffect(() => {
    fetchProperty()
  }, [propertyId])

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitleAlign: 'center',
      headerTitle: 'Property Details'
    })
  }, [navigation])

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'web') {
        document.title = 'Property Details'
      }
    }, [])
  )

  if (!property) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="small" color="#353949" />
      </View>
    )
  }

  return (
    <ScrollView
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      className="bg-white"
      contentContainerStyle={{ paddingBottom: 20 }}>
      <View>
        {Platform.OS === 'web' ? (
          <ScrollView
            ref={imageScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
              useNativeDriver: false,
              listener: onScroll
            })}
            onMomentumScrollEnd={(event) => {
              const offsetX = event.nativeEvent.contentOffset.x
              const pageIndex = Math.round(offsetX / width)
              imageScrollRef.current?.scrollTo({ x: pageIndex * width, animated: true })
            }}
            contentContainerStyle={{
              alignItems: 'center'
            }}>
            {property.images.map((item) => (
              <View
                key={item.id}
                style={{
                  width,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: 10
                }}>
                <Image
                  source={{ uri: item.url }}
                  style={{
                    width: '100%',
                    maxWidth: 800,
                    aspectRatio: 16 / 9,
                    resizeMode: 'contain'
                  }}
                />
              </View>
            ))}
          </ScrollView>
        ) : (
          // Vista móvil: carrusel paginado
          <ScrollView
            ref={imageScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
              useNativeDriver: false,
              listener: onScroll
            })}>
            {property.images.map((item) => (
              <Image
                key={item.id}
                source={{ uri: item.url }}
                style={{ width: screenWidth, height: 300 }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        )}

        <View
          className="overflow-hidden justify-center align-middle absolute mt-2 mb-3 bg-black/50 bottom-1 rounded-full"
          style={{
            height: DOT_SIZE * 3,
            width: DOT_CONTAINER_WIDTH,
            left: (width - DOT_CONTAINER_WIDTH) / 2
          }}>
          <Animated.View
            style={{
              flexDirection: 'row',
              transform: [
                {
                  translateX: dotsScrollX.interpolate({
                    inputRange: [0, property.images.length * (DOT_SIZE + DOT_SPACING)],
                    outputRange: [0, -property.images.length * (DOT_SIZE + DOT_SPACING)],
                    extrapolate: 'clamp'
                  })
                }
              ]
            }}>
            {property.images.map((_, index) => {
              const inputRange = [(index - 1) * width, index * width, (index + 1) * width]
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

        {Platform.OS === 'web' && (
          <View className="flex-row justify-between items-center px-4 mt-2">
            <TouchableOpacity
              className="bg-[#353949] px-4 py-2 rounded-lg disabled:opacity-50"
              disabled={currentIndex === 0}
              onPress={() => goToImage(currentIndex - 1)}>
              <Text className="text-white">Previous</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-[#353949] px-4 py-2 rounded-lg disabled:opacity-50"
              disabled={property && currentIndex === property.images.length - 1}
              onPress={() => goToImage(currentIndex + 1)}>
              <Text className="text-white">Next</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View className="p-4">
        <Text className="text-xl font-bold text-black mb-1 capitalize">
          {property.type}
          <Text className="normal-case"> in </Text>
          {property.street} {property.street_number}, {property.locality}
        </Text>
        <Text className="text-lg text-[#353949] font-semibold mb-2">
          €{property.price.toLocaleString()} {property.operation === 'sell' ? '' : '/ month'}
        </Text>

        <View className="flex-row flex-wrap gap-4 mb-4">
          <View className="flex-row items-center gap-1">
            <Ionicons name="bed-outline" size={18} color="#555" />
            <Text>{property.bedrooms} Beds</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="water-outline" size={18} color="#555" />
            <Text>{property.bathrooms} Baths</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="resize-outline" size={18} color="#555" />
            <Text>{property.size} m²</Text>
          </View>
        </View>

        <Text className="text-gray-700 mb-6">{property.description}</Text>

        {property.features.length > 0 && (
          <View className="flex-row flex-wrap gap-2 mb-6">
            {property.features.map((feature) => (
              <View key={feature.id} className="bg-darkBlue px-3 py-1 rounded-lg">
                <Text className="text-white text-xs">{feature.name}</Text>
              </View>
            ))}
          </View>
        )}

        {property.latitude && property.longitude && (
          <MapPreview
            initialLatitude={Number(property.latitude)}
            initialLongitude={Number(property.longitude)}
            showMarker={true}
            move={true}
            title={'Address'}
            description={`${property.street}, ${property.locality}`}
            onPress={() => {}}
          />
        )}

        <TouchableOpacity className="bg-[#353949] rounded-xl p-4 items-center mt-4">
          <Text className="text-white text-base font-medium">Contact Owner</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

export default PropertyView
