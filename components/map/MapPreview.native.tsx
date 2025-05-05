import React, { useState } from 'react'

import { Text, View } from 'react-native'
import MapView, { Callout, Marker } from 'react-native-maps'

import { router } from 'expo-router'

import { Ionicons } from '@expo/vector-icons'

interface MapViewComponentProps {
  initialLatitude: number
  initialLongitude: number
  showMarker: boolean
  onPress?: () => void
}

const MapViewComponent = ({
  initialLatitude,
  initialLongitude,
  showMarker,
  onPress
}: MapViewComponentProps) => {
  const [markerCoords, setMarkerCoords] = useState({
    latitude: initialLatitude,
    longitude: initialLongitude
  })

  const handleMarkerDragEnd = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate
    setMarkerCoords({ latitude, longitude })
  }

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
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
        onPress={handlePress}
        region={{
          latitude: markerCoords.latitude,
          longitude: markerCoords.longitude,
          latitudeDelta,
          longitudeDelta
        }}
        onMarkerDragEnd={handleMarkerDragEnd}>
        {showMarker && (
          <Marker
            coordinate={{
              latitude: markerCoords.latitude,
              longitude: markerCoords.longitude
            }}
            draggable
            title="Propiedad seleccionada"
            description="Esta es la propiedad que has elegido">
            <View className="items-center -mb-1">
              <View className="p-[1.5px] bg-white rounded-full shadow-md shadow-black/30">
                <View className="bg-red-500 w-8 h-8 rounded-full items-center justify-center">
                  <Ionicons name="home" size={16} color="white" />
                </View>
              </View>
              <View className="w-2 h-2 bg-red-500 rounded-full mt-1 shadow-sm shadow-black/30" />
            </View>

            <Callout>
              <View className="p-2">
                <Text className="font-bold">Propiedad seleccionada</Text>
                <Text>Lat: {markerCoords.latitude.toFixed(4)}</Text>
                <Text>Lng: {markerCoords.longitude.toFixed(4)}</Text>
              </View>
            </Callout>
          </Marker>
        )}
      </MapView>
    </View>
  )
}

export default MapViewComponent
