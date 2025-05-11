import React from 'react'
import { FlatList, Image, ScrollView, View } from 'react-native'

type AppImage = {
  uri: string
}

type Props = {
  images: AppImage[]
}

const ImageCarousel: React.FC<Props> = ({ images }) => {
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
                marginRight: (index + 1) % 3 === 0 ? 0 : 12
              }}>
              <Image source={{ uri: item.uri }} className="w-28 h-28 rounded-md" />
            </View>
          )}
          numColumns={3}
          scrollEnabled={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            marginTop: 10
          }}
        />
      </ScrollView>
    </View>
  )
}

export default ImageCarousel
