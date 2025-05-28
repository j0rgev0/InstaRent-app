import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'
import { router } from 'expo-router'
import React, { useEffect, useState } from 'react'

import '@/global.css'
import { GOOGLE_MAPS_API_KEY } from '@/utils/constants'

const libraries: 'places'[] = ['places']

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
  description,
  onPress
}: MapViewComponentProps) => {
  const [markerCoords, setMarkerCoords] = useState({
    lat: initialLatitude,
    lng: initialLongitude
  })

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY || '',
    libraries
  })

  useEffect(() => {
    setMarkerCoords({
      lat: initialLatitude,
      lng: initialLongitude
    })
  }, [initialLatitude, initialLongitude])

  const handleMapClick = () => {
    if (onPress) {
      onPress()
    } else {
      router.replace('/(root)/(properties)/maps')
    }
  }

  const mapContainerStyle = {
    width: '100%',
    height: '200px',
    borderRadius: '12px',
    marginBottom: '16px'
  }

  const center = {
    lat: markerCoords.lat,
    lng: markerCoords.lng
  }

  const zoom = showMarker ? 15 : 6

  if (loadError) {
    return <div style={{ padding: 20 }}>Error loading Google Maps</div>
  }

  if (!isLoaded) {
    return <div style={{ padding: 20 }}>Loading...</div>
  }

  return (
    <div style={{ width: '100%' }}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={zoom}
        onClick={handleMapClick}
        options={{
          scrollwheel: move,
          zoomControl: move,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          gestureHandling: move ? 'greedy' : 'none'
        }}>
        {showMarker && <Marker position={markerCoords} />}
      </GoogleMap>
    </div>
  )
}

export default MapViewComponent
