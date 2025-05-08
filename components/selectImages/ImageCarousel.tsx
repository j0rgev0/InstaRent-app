import React from 'react'
import { Image, ScrollView, StyleSheet, View } from 'react-native'

type AppImage = {
  uri: string
}

type Props = {
  images: AppImage[]
}

const ImageCarousel: React.FC<Props> = ({ images }) => {
  return (
    <ScrollView horizontal style={{ marginTop: 10 }}>
      {images.map((img, i) => (
        <View key={i} style={styles.imageContainer}>
          <Image source={{ uri: img.uri }} style={styles.imagePreview} />
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  imageContainer: {
    marginRight: 10
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 10
  }
})

export default ImageCarousel
