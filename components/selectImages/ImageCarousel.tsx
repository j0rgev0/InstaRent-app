import React from 'react'
import { FlatList, Image, ScrollView, View } from 'react-native'

type AppImage = {
  uri: string
}

type Props = {
  images: AppImage[]
}

const ImageCarousel: React.FC<Props> = ({ images }) => {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <FlatList
        data={images}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View className="mr-3 mb-3">
            <Image source={{ uri: item.uri }} className="w-28 h-28 rounded-md" />
          </View>
        )}
        numColumns={3}
        scrollEnabled={false}
        contentContainerStyle={{ marginTop: 10 }}
      />
    </ScrollView>
  )
}

export default ImageCarousel
