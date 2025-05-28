import React, { useEffect, useState } from 'react'

import { View } from 'react-native'
import MapView, { Marker } from 'react-native-maps'

import { router } from 'expo-router'

import { Ionicons } from '@expo/vector-icons'

interface MapViewComponentProps {
  initialLatitude: number
  initialLongitude: number
  showMarker: boolean
  description?: string
  move: boolean
  title?: string
  onPress?: () => void
}

const MapViewComponent = ({
  initialLatitude,
  initialLongitude,
  showMarker,
  move,
  title,
  description,
  onPress
}: MapViewComponentProps) => {
  const [markerCoords, setMarkerCoords] = useState({
    latitude: initialLatitude,
    longitude: initialLongitude
  })

  useEffect(() => {
    setMarkerCoords({
      latitude: initialLatitude,
      longitude: initialLongitude
    })
  }, [initialLatitude, initialLongitude])

  const latitudeDelta = showMarker ? 0.001 : 6.0
  const longitudeDelta = showMarker ? 0.001 : 6.0

  const handlePress = () => {
    if (onPress) {
      onPress()
    } else {
      router.replace('/(root)/(properties)/maps')
    }
  }

  return (
    <View>
      <MapView
        style={{ width: '100%', height: 200, borderRadius: 12, marginBottom: 16 }}
        scrollEnabled={move}
        zoomEnabled={move}
        pitchEnabled={move}
        rotateEnabled={move}
        onPress={handlePress}
        region={{
          latitude: markerCoords.latitude,
          longitude: markerCoords.longitude,
          latitudeDelta,
          longitudeDelta
        }}>
        {showMarker && (
          <Marker
            coordinate={{
              latitude: markerCoords.latitude,
              longitude: markerCoords.longitude
            }}
            title={title}
            description={description}>
            <View className="items-center -mb-1">
              <View className="p-[1.5px] bg-white rounded-full shadow-md shadow-black/30">
                <View className="bg-red-500 w-8 h-8 rounded-full items-center justify-center">
                  <Ionicons name="home" size={16} color="white" />
                </View>
              </View>
              <View className="w-2 h-2 bg-red-500 rounded-full mt-1 shadow-sm shadow-black/30" />
            </View>
          </Marker>
        )}
      </MapView>
    </View>
  )
}

export default MapViewComponent
