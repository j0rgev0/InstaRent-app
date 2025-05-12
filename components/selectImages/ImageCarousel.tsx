import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { FlatList, Image, Pressable, ScrollView, Text, View } from 'react-native'

type AppImage = {
  uri: string
}

type Props = {
  images: AppImage[]
  onRemove: (uri: string) => void
}

const ImageCarousel: React.FC<Props> = ({ images, onRemove }) => {
  if (images.length === 0) return null

  const itemHeight = 112
  const rows = Math.ceil(images.length / 3)
  const height = Math.min(rows * itemHeight, itemHeight * 3)

  return (
    <View style={{ height }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <FlatList
          data={images}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View
              className="mb-3"
              style={{
                marginRight: (index + 1) % 3 === 0 ? 0 : 22
              }}>
              <View
                className="shadow-lg bg-white rounded-md"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.35,
                  shadowRadius: 4,
                  elevation: 6
                }}>
                <View className="w-28 h-28 rounded-md overflow-hidden relative">
                  <Image source={{ uri: item.uri }} className="w-full h-full" />
                  <Pressable
                    onPress={() => onRemove(item.uri)}
                    className="absolute top-1 right-1 w-8 h-6 rounded-full bg-white/60 items-center justify-center">
                    <Ionicons  name="trash-outline" color={'red'} />
                  </Pressable>
                </View>
              </View>
            </View>
          )}
          numColumns={3}
          className="w-full mt-3"
          scrollEnabled={false}
        />
      </ScrollView>
    </View>
  )
}

export default ImageCarousel
