import React, { useState } from 'react'
import { Text, View } from 'react-native'

import { useLocalSearchParams } from 'expo-router'

import { INSTARENT_API_KEY, INSTARENT_API_URL } from '@/utils/constants'
import { Property } from '@/utils/types'

const PropertyView = () => {
  const params = useLocalSearchParams()

  const propertyId = params.propertyId
  const [propertie, setPropertie] = useState<Property[]>([])

  const fetchPropertie = async () => {
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

      if (!response.ok) {
        throw new Error(data.error || 'Error getting properties')
      }

      setPropertie(data)
    } catch (error) {
      console.error('Error getting properties', error)
    }
  }

  return (
    <View>
      <Text>HOLA</Text>
    </View>
  )
}

export default PropertyView
