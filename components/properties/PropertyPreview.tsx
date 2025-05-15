import React, { useRef } from 'react'
import { Animated, Image, Pressable, Text, View } from 'react-native'
import { Swipeable } from 'react-native-gesture-handler'

import '@/global.css'

const ACTION_WIDTH = 64

type Feature = {
  id: string
  property_id: string
  name: string
}

type ImageType = {
  id: string
  property_id: string
  url: string
  public_id: string
}

type Property = {
  id: string
  type: string
  street: string
  locality: string
  price: number
  bedrooms: number
  bathrooms: number
  features: Feature[]
  images: ImageType[]
}

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

const renderRightActions = (progress: Animated.AnimatedInterpolation<number>) => (
  <View className="relative w-56 h-full justify-center flex-row space-x-2">
    <AnimatedAction index={2} progress={progress}>
      <Pressable
        onPress={() => console.log('Delete')}
        className="bg-red-500 w-24 h-24 rounded-full shadow-sm items-center justify-center">
        <Text className="text-white font-semibold text-sm">Delete</Text>
      </Pressable>
    </AnimatedAction>
    <AnimatedAction index={1} progress={progress}>
      <Pressable
        onPress={() => console.log('Edit')}
        className="bg-[#eab308] w-24 h-24 rounded-full shadow-sm items-center justify-center">
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

const PropertyPreview = ({
  property,
  swipeableRef
}: {
  property: Property
  swipeableRef: React.MutableRefObject<Swipeable | null>
}) => {
  const localRef = useRef<Swipeable>(null)

  const handleSwipeStart = () => {
    if (swipeableRef.current && swipeableRef.current !== localRef.current) {
      swipeableRef.current.close()
    }
    swipeableRef.current = localRef.current
  }

  return (
    <Swipeable
      ref={localRef}
      renderRightActions={renderRightActions}
      onSwipeableWillOpen={handleSwipeStart}>
      <View key={property.id} className="bg-gray-200 rounded-2xl mb-6 shadow-sm">
        {property.images[0] && (
          <View>
            <Image
              source={{ uri: property.images[0].url }}
              className="w-full h-48 rounded-t-2xl"
              resizeMode="cover"
            />
            <Text className="absolute bottom-1 right-1 p-2 bg-white/60 rounded-xl text-darkBlue font-semibold">
              {property.images.length} {property.images.length > 1 ? 'images' : 'image'}
            </Text>
          </View>
        )}

        <View className="p-4">
          <Text className="text-lg font-semibold text-darkBlue capitalize">
            {property.type}
            <Text className="normal-case"> in </Text>
            {property.street}, {property.locality}
          </Text>
          <Text className="text-sm text-gray-500 mt-1 mb-3">
            {property.price} €/month · {property.bedrooms} bed · {property.bathrooms} bath
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
      </View>
    </Swipeable>
  )
}

export default PropertyPreview
