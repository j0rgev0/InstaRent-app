import { INSTARENT_API_KEY, INSTARENT_API_URL } from '@/utils/constants'
import { Property } from '@/utils/types'
import { Ionicons } from '@expo/vector-icons'
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router'
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions
} from 'react-native'

// @ts-ignore
import MapPreview from '@/components/map/MapPreview'
import { authClient } from '@/lib/auth-client'
import { useSocket } from '@/lib/socket'

const VISIBLE_DOTS = 5
const DOT_SIZE = 8
const DOT_SPACING = 4
const DOT_CONTAINER_WIDTH = VISIBLE_DOTS * (DOT_SIZE + DOT_SPACING)

const screenWidth = Dimensions.get('window').width

const PropertyView = () => {
  const { data: session } = authClient.useSession()
  const userId = session?.user?.id
  const socket = useSocket()

  const navigation = useNavigation()
  const params = useLocalSearchParams()
  const { width } = useWindowDimensions()

  const fromHome = params.fromHome === 'true' ? true : false

  const propertyId = params.propertyId as string | undefined
  const [property, setProperty] = useState<Property | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const imageScrollRef = useRef<ScrollView>(null)

  const [refreshing, setRefreshing] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)

  const roomChatID = [property?.id, session?.user.id].join('::')

  const sharedParams = {
    propertyid: property?.id,
    operationTypes: property?.operation,
    housingTypes: property?.type,
    description: property?.description,
    bathrooms: property?.bathrooms,
    bedrooms: property?.bedrooms,
    size: property?.size,
    price: property?.price,
    latitude: property?.latitude,
    longitude: property?.longitude,
    floor: property?.floor,
    letter: property?.letter,
    conservation: property?.conservation,
    constructionYear: property?.construction_year
  }

  const scrollX = useRef(new Animated.Value(0)).current
  const dotsScrollX = useRef(new Animated.Value(0)).current

  const handleEdit = () => {
    if (Platform.OS !== 'web') {
      Alert.alert('Edit property', 'What would you like to do?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Change images & features',
          onPress: () => {
            router.push({
              pathname: '/(root)/(properties)/addPictures',
              params: {
                propertyId,
                edit: 'true'
              }
            })
          }
        },
        {
          text: 'Edit general information',
          onPress: () => {
            router.push({
              pathname: '/(root)/(properties)/publish',
              params: {
                ...sharedParams,
                edit: 'true'
              }
            })
          }
        }
      ])
    } else {
      setEditModalVisible(true)
    }
  }

  const handleChat = () => {
    if (userId) {
      socket.fetchUnreadCount(userId)
    }

    router.push({
      pathname: '/(root)/(chat)/chat',
      params: {
        propertyOwner: property?.user_id,
        roomChatID
      }
    })
  }

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

  const openInGoogleMaps = () => {
    const lat = property?.latitude
    const lng = property?.longitude
    const label = encodeURIComponent(`${property?.street}, ${property?.locality}`)
    const url = Platform.select({
      ios: `http://maps.apple.com/?ll=${lat},${lng}&q=${label}`,
      android: `geo:${lat},${lng}?q=${label}`,
      web: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    })
    if (url) Linking.openURL(url)
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
      StatusBar.setBarStyle('dark-content', true)

      if (Platform.OS === 'web') {
        document.title = 'Property Details'
      }
    }, [])
  )

  if (!property) {
    return Platform.OS === 'web' ? (
      <div style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="small" color="#353949" />
      </div>
    ) : (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="small" color="#353949" />
      </View>
    )
  }

  const EditModal = () => (
    <View className="absolute w-full h-full rounded-2xl bg-black/40 z-50 items-center justify-center">
      <View className="bg-white rounded-2xl p-6 w-11/12 max-w-md space-y-4">
        <Text className="text-lg font-bold text-darkBlue">Edit property</Text>
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: '/(root)/(properties)/addPictures',
              params: {
                propertyId,
                edit: 'true'
              }
            })
          }}
          className="bg-yellow-500 p-3 rounded-lg">
          <Text className="text-white text-center font-semibold">Change images & features</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: '/(root)/(properties)/publish',
              params: {
                ...sharedParams,
                edit: 'true'
              }
            })
          }}
          className="bg-darkBlue p-3 rounded-lg">
          <Text className="text-white text-center font-semibold">Edit general information</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setEditModalVisible(false)}
          className="mt-2 p-2 rounded-lg border border-gray-300">
          <Text className="text-center text-darkBlue">Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderContent = () => (
    <>
      <View>
        {property.images && property.images.length > 0 ? (
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
                contentContainerStyle={{ alignItems: 'center' }}>
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

            {Platform.OS === 'web' ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 8,
                  gap: 8,
                  position: 'relative',
                  zIndex: 1
                }}>
                <TouchableOpacity
                  className="bg-darkBlue px-3 py-1 rounded-lg disabled:opacity-50"
                  disabled={currentIndex === 0}
                  onPress={() => goToImage(currentIndex - 1)}>
                  <Ionicons name="chevron-back" size={16} color="white" />
                </TouchableOpacity>

                <div
                  style={{
                    overflow: 'hidden',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    borderRadius: '9999px',
                    height: DOT_SIZE * 3,
                    width:
                      property.images.length < VISIBLE_DOTS
                        ? property.images.length * (DOT_SIZE + DOT_SPACING)
                        : DOT_CONTAINER_WIDTH,
                    position: 'relative'
                  }}>
                  <Animated.View
                    style={{
                      flexDirection: 'row',
                      position: 'absolute',
                      left: 0,
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
                </div>

                <TouchableOpacity
                  className="bg-darkBlue px-3 py-1 rounded-lg disabled:opacity-50"
                  disabled={currentIndex === property.images.length - 1}
                  onPress={() => goToImage(currentIndex + 1)}>
                  <Ionicons name="chevron-forward" size={16} color="white" />
                </TouchableOpacity>
              </div>
            ) : (
              <View
                className="overflow-hidden justify-center align-middle absolute mt-2 mb-3 bg-black/50 bottom-1 rounded-full"
                style={{
                  height: DOT_SIZE * 3,
                  width:
                    property.images.length < VISIBLE_DOTS
                      ? property.images.length * (DOT_SIZE + DOT_SPACING)
                      : DOT_CONTAINER_WIDTH,
                  left:
                    property.images.length < VISIBLE_DOTS
                      ? (width - property.images.length * (DOT_SIZE + DOT_SPACING)) / 2
                      : (width - DOT_CONTAINER_WIDTH) / 2
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
            )}
          </View>
        ) : (
          <View className="w-full h-60 bg-gray-200 justify-center items-center mb-4">
            <Image
              source={require('@/assets/images/NotAvalibleImg.png')}
              style={{ maxWidth: 500, maxHeight: 300, width: '100%' }}
            />
          </View>
        )}
      </View>

      <View className="p-4">
        <Text
          className="text-xl font-bold text-black mb-1 capitalize"
          numberOfLines={2}
          ellipsizeMode="tail">
          {property.type}
          <Text className="normal-case">
            {' '}
            {property.operation === 'rent' ? 'for rent on' : 'for sale in'}{' '}
          </Text>
          {property.street} {property.street_number}, {property.locality}
        </Text>

        <Text className="text-gray-600 mb-2 capitalize">
          {property.street}, {property.street_number},{' '}
          {property.neighborhood ? property.neighborhood + ', ' : ''}
          {property.postal_code} {property.locality}, {property.province}, {property.country}
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

        <View className="mb-4">
          <Text className="text-sm text-gray-500">
            Floor: {property.floor > 0 ? property.floor : 'N/A'}
            {property.letter ? `, ${property.letter}` : ''}
          </Text>
          {property.construction_year > 0 ? (
            <Text className="text-sm text-gray-500">Built in: {property.construction_year}</Text>
          ) : null}

          {property.neighborhood.length > 1 ? (
            <Text className="text-sm text-gray-500 capitalize">
              Neighborhood: {property.neighborhood}
            </Text>
          ) : null}
          <Text className="text-sm text-gray-500 capitalize">
            Conservation: {property.conservation}
          </Text>
        </View>

        {property.latitude && property.longitude && (
          <>
            <MapPreview
              initialLatitude={Number(property.latitude)}
              initialLongitude={Number(property.longitude)}
              showMarker={true}
              move={true}
              title={'Address'}
              description={`${property.street}, ${property.locality}`}
              onPress={() => {}}
            />
          </>
        )}
        <TouchableOpacity className="mt-2" onPress={openInGoogleMaps}>
          <Text className="text-blue-600 underline text-sm">View in Google Maps</Text>
        </TouchableOpacity>
      </View>
    </>
  )

  const renderBottomButton = () => (
    <>
      {!fromHome || property.user_id === session?.user.id ? (
        <TouchableOpacity
          onPress={handleEdit}
          className="bg-darkBlue rounded-xl p-4 items-center mt-4">
          <Text className="text-white text-base font-medium">Edit</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={handleChat}
          className="bg-darkBlue rounded-xl p-4 items-center mt-4">
          <Text className="text-white text-base font-medium">Contact Owner</Text>
        </TouchableOpacity>
      )}
    </>
  )

  return Platform.OS === 'web' ? (
    <div
      style={{
        flex: 1,
        backgroundColor: 'white',
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ paddingBottom: 20 }}>
          {renderContent()}
        </ScrollView>
      </div>
      <div
        style={{
          backgroundColor: 'white',
          borderTop: '1px solid #e5e7eb',
          padding: '16px 16px 40px',
          position: 'sticky',
          bottom: 0
        }}>
        {renderBottomButton()}
      </div>
      {editModalVisible && <EditModal />}
    </div>
  ) : (
    <View className="flex-1 bg-white">
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 20 }}>
        {renderContent()}
      </ScrollView>

      <View className="bg-white border-t border-gray-200 px-4 py-3 pb-10">
        {renderBottomButton()}
      </View>
      {editModalVisible && <EditModal />}
    </View>
  )
}

export default PropertyView
