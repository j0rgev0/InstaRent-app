import React, { useRef, useState } from 'react'
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

import { Ionicons } from '@expo/vector-icons'

import '@/global.css'

const { height, width } = Dimensions.get('window')
const VISIBLE_DOTS = 5
const DOT_SIZE = 8
const DOT_SPACING = 4
const DOT_CONTAINER_WIDTH = VISIBLE_DOTS * (DOT_SIZE + DOT_SPACING)

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

export default PropertyCard
