import React, { useEffect, useRef, useState } from 'react'
import { RefreshControl, ScrollView } from 'react-native'
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler'

import { authClient } from '@/lib/auth-client'

import PropertyPreview from '@/components/properties/PropertyPreview'

import { INSTARENT_API_KEY, INSTARENT_API_URL } from '@/utils/constants'
import { Property } from '@/utils/types'

import '@/global.css'

const MyProperties = () => {
  const { data: session } = authClient.useSession()
  const userid = session?.user.id
  const [properties, setProperties] = useState<Property[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const swipeableRef = useRef<Swipeable | null>(null)

  const fetchProperties = async () => {
    if (!userid) return
    try {
      const response = await fetch(`${INSTARENT_API_URL}/properties?userid=${userid}`, {
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

      setProperties(data)
    } catch (error) {
      console.error('Error getting properties', error)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchProperties()
    setRefreshing(false)
  }

  useEffect(() => {
    fetchProperties()
  }, [userid])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView
        className="bg-white px-4 pt-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {properties.map((property) => (
          <PropertyPreview
            key={property.id}
            property={property}
            swipeableRef={swipeableRef}
            onDelete={fetchProperties}
          />
        ))}
      </ScrollView>
    </GestureHandlerRootView>
  )
}

export default MyProperties
