import '@/global.css'
import { INSTARENT_API_KEY, INSTARENT_API_URL } from '@/utils/constants'
import { Property } from '@/utils/types'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import { Alert, Animated, Image, Platform, Pressable, Text, View } from 'react-native'
import { Swipeable } from 'react-native-gesture-handler'

const ACTION_WIDTH = 64

const AnimatedAction = ({
  children,
  index,
  progress
}: {
  children: React.ReactNode
  index: number
  progress: Animated.AnimatedInterpolation<number>
}) => {
  const inputRange = [0, 1]
  const outputRange = [ACTION_WIDTH * (index + 1), 0]
  const translateX = progress.interpolate({
    inputRange,
    outputRange,
    extrapolate: 'clamp'
  })

  const scale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
    extrapolate: 'clamp'
  })

  return (
    <Animated.View
      style={[
        {
          transform: [{ translateX }, { scale }],
          zIndex: 10 - index,
          position: 'absolute',
          right: ACTION_WIDTH * index,
          height: '100%',
          justifyContent: 'center',
          width: ACTION_WIDTH
        }
      ]}>
      {children}
    </Animated.View>
  )
}

async function delProperty(propertyid: string) {
  try {
    const response = await fetch(`${INSTARENT_API_URL}/properties/delete/${propertyid}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${INSTARENT_API_KEY}`
      }
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error deleting property')
    }

    return data
  } catch (error) {
    console.error('Error deleting property', error)
    throw error
  }
}

const PropertyPreview = ({
  property,
  swipeableRef,
  onDelete
}: {
  property: Property
  swipeableRef: React.MutableRefObject<Swipeable | null>
  onDelete: () => void
}) => {
  const localRef = useRef<Swipeable>(null)
  const [mouseDownPosition, setMouseDownPosition] = useState<{ x: number; y: number } | null>(null)

  const [editModalVisible, setEditModalVisible] = useState(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)

  const sharedParams = {
    propertyid: property.id,
    operationTypes: property.operation,
    housingTypes: property.type,
    description: property.description,
    bathrooms: property.bathrooms,
    bedrooms: property.bedrooms,
    size: property.size,
    price: property.price,
    latitude: property.latitude,
    longitude: property.longitude,
    floor: property.floor,
    letter: property.letter,
    conservation: property.conservation,
    constructionYear: property.construction_year
  }

  const handleSwipeStart = () => {
    if (swipeableRef.current && swipeableRef.current !== localRef.current) {
      swipeableRef.current.close()
    }
    swipeableRef.current = localRef.current
  }

  const handleDelete = async () => {
    if (Platform.OS !== 'web') {
      Alert.alert('Delete property', 'Are you sure you want to delete this property?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await delProperty(property.id)
              onDelete()
            } catch (error) {
              console.error(error)
            }
          }
        }
      ])
    } else {
      setDeleteModalVisible(true)
    }
  }

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
                propertyId: property.id,
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

  const handleViewProperty = () => {
    router.push({
      pathname: '/(root)/(properties)/propertyView',
      params: {
        propertyId: property.id
      }
    })
  }

  const DeleteModal = () => (
    <View className="absolute w-full h-full rounded-2xl bg-black/40 z-50 items-center justify-center">
      <View className="bg-white rounded-2xl p-6 w-11/12 max-w-md space-y-4">
        <Text className="text-lg font-bold text-darkBlue">Delete property</Text>
        <Text>Are you sure you want to delete this property?</Text>
        <View className="flex-row justify-between space-x-4">
          <Pressable
            onPress={() => setDeleteModalVisible(false)}
            className="flex-1 border border-gray-300 rounded-lg p-3">
            <Text className="text-center text-darkBlue font-semibold">Cancel</Text>
          </Pressable>
          <Pressable
            onPress={async () => {
              try {
                await delProperty(property.id)
                onDelete()
                setDeleteModalVisible(false)
              } catch (error) {
                console.error(error)
              }
            }}
            className="flex-1 bg-red-500 rounded-lg p-3">
            <Text className="text-center text-white font-semibold">Delete</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )

  const EditModal = () => (
    <View className="absolute w-full h-full rounded-2xl bg-black/40 z-50 items-center justify-center">
      <View className="bg-white rounded-2xl p-6 w-11/12 max-w-md space-y-4">
        <Text className="text-lg font-bold text-darkBlue">Edit property</Text>
        <Pressable
          onPress={() => {
            router.replace({
              pathname: '/(root)/(properties)/addPictures',
              params: {
                propertyId: property.id,
                edit: 'true'
              }
            })
          }}
          className="bg-yellow-500 p-3 rounded-lg">
          <Text className="text-white text-center font-semibold">Change images & features</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            router.replace({
              pathname: '/(root)/(properties)/publish',
              params: {
                ...sharedParams,
                edit: 'true'
              }
            })
          }}
          className="bg-darkBlue p-3 rounded-lg">
          <Text className="text-white text-center font-semibold">Edit general information</Text>
        </Pressable>
        <Pressable
          onPress={() => setEditModalVisible(false)}
          className="mt-2 p-2 rounded-lg border border-gray-300">
          <Text className="text-center text-darkBlue">Cancel</Text>
        </Pressable>
      </View>
    </View>
  )
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setEditModalVisible(false)
          setDeleteModalVisible(false)
        }
      }
      if (editModalVisible || deleteModalVisible) {
        window.addEventListener('keydown', handleKeyDown)
      }
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [editModalVisible, deleteModalVisible])

  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>) => (
    <View className="relative w-56 h-full justify-center flex-row space-x-2">
      <AnimatedAction index={2} progress={progress}>
        <Pressable
          onPress={handleDelete}
          className="bg-red-500 w-24 h-24 rounded-full shadow-sm items-center justify-center">
          <Text className="text-white font-semibold text-sm">Delete</Text>
        </Pressable>
      </AnimatedAction>
      <AnimatedAction index={1} progress={progress}>
        <Pressable
          onPress={handleEdit}
          className="bg-yellow-500 w-24 h-24 rounded-full shadow-sm items-center justify-center">
          <Text className="text-white font-semibold text-sm">Edit</Text>
        </Pressable>
      </AnimatedAction>
      <AnimatedAction index={0} progress={progress}>
        <Pressable
          onPress={() => console.log('View')}
          className="bg-darkBlue w-24 h-24 rounded-full shadow-sm items-center justify-center">
          <Text className="text-white font-semibold text-sm">View</Text>
        </Pressable>
      </AnimatedAction>
    </View>
  )

  return (
    <Swipeable
      ref={localRef}
      renderRightActions={renderRightActions}
      onSwipeableWillOpen={handleSwipeStart}
      overshootRight={false}
      friction={2}>
      {Platform.OS === 'web' ? (
        <View
          onStartShouldSetResponder={() => true}
          onResponderGrant={(e) =>
            setMouseDownPosition({ x: e.nativeEvent.pageX, y: e.nativeEvent.pageY })
          }
          onResponderRelease={(e) => {
            if (
              mouseDownPosition &&
              Math.abs(e.nativeEvent.pageX - mouseDownPosition.x) < 5 &&
              Math.abs(e.nativeEvent.pageY - mouseDownPosition.y) < 5
            ) {
              handleViewProperty()
            }
            setMouseDownPosition(null)
          }}
          key={property.id}
          className="bg-gray-200 rounded-2xl mb-6 shadow-sm border-gray-400 border"
          style={{ cursor: 'pointer' }}>
          <View className="items-center">
            <Image
              source={
                property.images[0]?.url
                  ? { uri: property.images[0].url }
                  : require('../../assets/images/NotAvalibleImg3.png')
              }
              className="w-full h-72"
              resizeMode="cover"
              style={{ maxWidth: 500, maxHeight: 300, width: '100%' }}
            />
            <Text className="absolute bottom-1 right-1 p-2 bg-white/60 rounded-xl text-darkBlue font-semibold">
              {property.images.length} {property.images.length > 1 ? 'images' : 'image'}
            </Text>
          </View>

          <Pressable
            onPress={() => localRef.current?.openRight()}
            className="absolute top-1 right-1 px-2 bg-white/60 rounded-lg">
            <Ionicons name="ellipsis-horizontal" color={'#353949'} size={20} />
          </Pressable>

          <View className="p-4">
            <Text className="text-lg font-semibold text-darkBlue capitalize">
              {property.type}
              <Text className="normal-case"> in </Text>
              {property.street}, {property.locality}
            </Text>
            <Text className="text-sm text-gray-500 mt-1 mb-3">
              {property.price}
              {property.operation === 'sell' ? '€' : '€/month'} · {property.bedrooms} bed ·{' '}
              {property.bathrooms} bath
            </Text>

            {property.features.length > 0 && (
              <View className="flex-row flex-wrap gap-2">
                {property.features.map((feature) => (
                  <View key={feature.id} className="bg-darkBlue px-3 py-1 rounded-lg">
                    <Text className="text-white text-xs">{feature.name}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {deleteModalVisible && <DeleteModal />}
          {editModalVisible && <EditModal />}
        </View>
      ) : (
        <Pressable
          onPress={handleViewProperty}
          key={property.id}
          className="bg-gray-200 rounded-2xl mb-6 shadow-sm border-gray-400 border">
          <View className="items-center">
            <Image
              source={
                property.images[0]?.url
                  ? { uri: property.images[0].url }
                  : require('../../assets/images/NotAvalibleImg3.png')
              }
              className={'w-full h-48 rounded-t-2xl'}
              resizeMode="cover"
            />
            <Text className="absolute bottom-1 right-1 p-2 bg-white/60 rounded-xl text-darkBlue font-semibold">
              {property.images.length} {property.images.length > 1 ? 'images' : 'image'}
            </Text>
          </View>

          <Pressable
            onPress={() => localRef.current?.openRight()}
            className="absolute top-1 right-1 px-2 bg-white/60 rounded-lg">
            <Ionicons name="ellipsis-horizontal" color={'#353949'} size={20} />
          </Pressable>

          <View className="p-4">
            <Text className="text-lg font-semibold text-darkBlue capitalize">
              {property.type}
              <Text className="normal-case"> in </Text>
              {property.street}, {property.locality}
            </Text>
            <Text className="text-sm text-gray-500 mt-1 mb-3">
              {property.price}
              {property.operation === 'sell' ? '€' : '€/month'} · {property.bedrooms} bed ·{' '}
              {property.bathrooms} bath
            </Text>

            {property.features.length > 0 && (
              <View className="flex-row flex-wrap gap-2">
                {property.features.map((feature) => (
                  <View key={feature.id} className="bg-darkBlue px-3 py-1 rounded-lg">
                    <Text className="text-white text-xs">{feature.name}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {editModalVisible && (
            <View className="absolute w-full h-full rounded-2xl bg-black/40 z-50 items-center justify-center">
              <View className="bg-white rounded-2xl p-6 w-11/12 max-w-md space-y-4">
                <Text className="text-lg font-bold text-darkBlue">Edit property</Text>
                <Pressable
                  onPress={() => {
                    router.replace({
                      pathname: '/(root)/(properties)/addPictures',
                      params: {
                        propertyId: property.id,
                        edit: 'true'
                      }
                    })
                  }}
                  className="bg-yellow-500 p-3 rounded-lg">
                  <Text className="text-white text-center font-semibold">
                    Change images & features
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    router.replace({
                      pathname: '/(root)/(properties)/publish',
                      params: {
                        ...sharedParams,
                        edit: 'true'
                      }
                    })
                  }}
                  className="bg-darkBlue p-3 rounded-lg">
                  <Text className="text-white text-center font-semibold">
                    Edit general information
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setEditModalVisible(false)}
                  className="mt-2 p-2 rounded-lg border border-gray-300">
                  <Text className="text-center text-darkBlue">Cancel</Text>
                </Pressable>
              </View>
            </View>
          )}
        </Pressable>
      )}
    </Swipeable>
  )
}

export default PropertyPreview
