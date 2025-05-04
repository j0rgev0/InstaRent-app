import { useLayoutEffect } from 'react'

import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import { Text, TouchableOpacity } from 'react-native'

// @ts-ignore
import MapComponent from '@/components/map/MapComponent'

export default function MapsScreen() {
  const navigation = useNavigation()
  const router = useRouter()
  const params = useLocalSearchParams()

  const {
    operationTypes,
    description,
    housingTypes,
    bathrooms,
    bedrooms,
    price,
    size,
    longitude,
    latitude
  } = params

  const sharedParams = {
    operationTypes,
    housingTypes,
    description,
    bathrooms,
    longitude,
    latitude,
    bedrooms,
    price,
    size
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Select Location',
      headerTitleAlign: 'center',
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => {
            router.replace({
              pathname: '/(root)/(properties)/publish',
              params: sharedParams
            })
          }}>
          <Text className="px-4 text-lg text-blue-500">Cancel</Text>
        </TouchableOpacity>
      )
    })
  }, [navigation, sharedParams])

  return <MapComponent />
}
