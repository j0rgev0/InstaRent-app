import React, { useEffect, useRef } from 'react'

import { GOOGLE_MAPS_API_KEY } from '@/utils/constants'
import { useLoadScript } from '@react-google-maps/api'

import '@/global.css'

type AddressAutocompleteProps = {
  onPlaceSelected: (place: google.maps.places.PlaceResult) => void
  placeholder?: string
}

const libraries: 'places'[] = ['places']

export default function AddressAutocomplete({
  onPlaceSelected,
  placeholder = 'Enter your address'
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY || '',
    libraries
  })

  useEffect(() => {
    if (isLoaded && inputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address']
      })

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        onPlaceSelected(place)
      })
    }
  }, [isLoaded])

  if (loadError) return <p>Error loading Google Maps</p>

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder={placeholder}
      className="rounded-xl border border-gray-400 h-14 px-4 mb-4"
    />
  )
}
