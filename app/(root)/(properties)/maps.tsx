import { useLayoutEffect } from 'react'

import { Text, TouchableOpacity } from 'react-native'

import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'

// @ts-ignore
import MapComponent from '@/components/map/OldMapComponent'

type PropertyParams = {
  edit: string
  propertyid?: string
  operationTypes: string
  housingTypes: string
  description: string
  bathrooms: string
  bedrooms: string
  price: string
  size: string
  longitude: string
  latitude: string
}

export default function MapsScreen() {
  const navigation = useNavigation()
  const router = useRouter()
  const params = useLocalSearchParams<PropertyParams>()

  const edit = params.edit === 'true'
  const propertyid = params.propertyid

  const sharedParams = {
    operationTypes: params.operationTypes,
    housingTypes: params.housingTypes,
    description: params.description,
    bathrooms: params.bathrooms,
    longitude: params.longitude,
    latitude: params.latitude,
    bedrooms: params.bedrooms,
    price: params.price,
    size: params.size
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
              params: {
                ...sharedParams,
                propertyid,
                edit: edit ? 'true' : 'false'
              }
            })
          }}>
          <Text className="px-4 text-lg text-blue-500">Cancel</Text>
        </TouchableOpacity>
      )
    })
  }, [navigation, sharedParams])

  return <MapComponent />
}
