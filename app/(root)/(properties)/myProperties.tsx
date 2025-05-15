import PropertyPreview from '@/components/properties/PropertyPreview'
import { authClient } from '@/lib/auth-client'
import { INSTARENT_API_KEY, INSTARENT_API_URL } from '@/utils/constants'
import React, { useEffect, useRef, useState } from 'react'
import { ScrollView } from 'react-native'
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler'

import '@/global.css'

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

const MyProperties = () => {
  const { data: session } = authClient.useSession()
  const userid = session?.user.id
  const [properties, setProperties] = useState<Property[]>([])
  const swipeableRef = useRef<Swipeable | null>(null)

  async function getAllProperties() {
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

      return data
    } catch (error) {
      console.error('Error getting properties', error)
      throw error
    }
  }

  useEffect(() => {
    const fetchProperties = async () => {
      if (!userid) return
      try {
        const data = await getAllProperties()
        setProperties(data)
      } catch (e) {
        console.error(e)
      }
    }

    fetchProperties()
  }, [userid])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView className="bg-white px-4 pt-4">
        {properties.map((property) => (
          <PropertyPreview key={property.id} property={property} swipeableRef={swipeableRef} />
        ))}
      </ScrollView>
    </GestureHandlerRootView>
  )
}
//   return (
//     <ScrollView className="bg-white px-4 pt-4">
//       {properties.map((property) => (
//         <View key={property.id} className="bg-gray-200 rounded-2xl mb-6 shadow-sm">
//           {property.images[0] && (
//             <View>
//               <Image
//                 source={{ uri: property.images[0].url }}
//                 className="w-full h-48 rounded-t-2xl"
//                 resizeMode="cover"
//               />
//               <Text className="absolute bottom-1 right-1 p-2 bg-white/60 rounded-xl text-darkBlue font-semibold">
//                 {property.images.length} {property.images.length > 1 ? 'images' : 'image'}
//               </Text>
//             </View>
//           )}

//           <View className="p-4">
//             <Text className="text-lg font-semibold text-darkBlue capitalize">
//               {property.type}
//               <Text className="normal-case"> in </Text>
//               {property.street}, {property.locality}
//             </Text>
//             <Text className="text-sm text-gray-500 mt-1 mb-3">
//               {property.price} €/month · {property.bedrooms} bed · {property.bathrooms} bath
//             </Text>

//             {property.features.length > 0 && (
//               <View className="flex-row flex-wrap gap-2">
//                 {property.features.map((feature) => (
//                   <View key={feature.id} className="bg-darkBlue px-3 py-1 rounded-lg">
//                     <Text className="text-white text-xs">{feature.name}</Text>
//                   </View>
//                 ))}
//               </View>
//             )}
//           </View>
//         </View>
//       ))}
//     </ScrollView>
//   )

export default MyProperties
