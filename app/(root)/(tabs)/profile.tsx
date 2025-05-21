import React, { useCallback, useState } from 'react'

import { router, useFocusEffect, useNavigation } from 'expo-router'
import {
  Alert,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

import * as ImagePicker from 'expo-image-picker'

import { Ionicons } from '@expo/vector-icons'

import { authClient } from '@/lib/auth-client'

import { CLOUDINARY_CLOUD_NAME } from '@/utils/constants'

import '@/global.css'

const ProfilePage = () => {
  const { data: session } = authClient.useSession()
  const navigation = useNavigation()

  const [refreshing, setRefreshing] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined)

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      router.replace('/(root)/(tabs)/profile')
    } catch (error) {
      console.error('Error al recargar los datos:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const showImageOptions = () => {
    if (session?.user.image) {
      Alert.alert('Profile Image', 'What would you like to do?', [
        {
          text: 'Change Image',
          onPress: () => selectImage(),
          style: 'default'
        },
        {
          text: 'Delete Image',
          onPress: () => authClient.updateUser({ image: null }),
          style: 'default'
        },
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel'
        }
      ])
    } else {
      Alert.alert('Profile Image', 'What would you like to do?', [
        {
          text: 'Change Image',
          onPress: () => selectImage(),
          style: 'default'
        },
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel'
        }
      ])
    }
  }

  const selectImage = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!')
          return
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 0.8,
        aspect: [1, 1],
        base64: Platform.OS !== 'web',
        mediaTypes: 'images'
      })

      if (!result.canceled) {
        const imageUri = result.assets[0].uri
        setSelectedImage(imageUri)

        if (session) {
          session.user.image = imageUri

          try {
            console.log('Preparing upload to Cloudinary...')

            const xhr = new XMLHttpRequest()
            const formData = new FormData()

            const fileUri = result.assets[0].uri
            const filename = fileUri.split('/').pop() || 'image.jpg'

            if (Platform.OS === 'web') {
              try {
                const response = await fetch(fileUri)
                const blob = await response.blob()
                formData.append('file', blob, filename)
              } catch (blobError) {
                console.error('Error creating blob from URI:', blobError)
                alert('Failed to process image. Please try a different image or format.')
                return
              }
            } else {
              const localUri = Platform.OS === 'ios' ? fileUri.replace('file://', '') : fileUri

              const file = {
                uri: localUri,
                name: filename,
                type: 'image/jpeg'
              }

              // @ts-ignore
              formData.append('file', file)
            }

            formData.append('upload_preset', 'profileImage')
            console.log('FormData prepared, sending to Cloudinary...')
            xhr.open(
              'POST',
              `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`
            )

            xhr.onload = async function () {
              if (xhr.status >= 200 && xhr.status < 300) {
                const response = JSON.parse(xhr.responseText)
                console.log('Upload successful!', response.url)

                if (response.url) {
                  await authClient.updateUser({ image: response.url })
                  console.log('User image updated in database')
                  session.user.image = response.url
                }
              } else {
                console.error('Upload failed with status:', xhr.status, xhr.responseText)
                alert('Failed to upload image. Please try again.')
              }
            }

            xhr.onerror = function () {
              console.error('Network error during upload:', xhr.responseText)
              alert('Network error occurred. Please try again.')
            }

            xhr.send(formData)
          } catch (error) {
            console.error('Error uploading image to Cloudinary:', error)
            alert('Failed to upload image. Please try again.')
          }
        }
      }
    } catch (error) {
      console.error('Error picking image:', error)
    }
  }

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('dark-content', true)

      if (Platform.OS === 'web') {
        document.title = 'Profile'
      }
    }, [])
  )

  return (
    <View className="bg-white h-full" style={{ paddingTop: Platform.OS === 'web' ? 15 : 50 }}>
      <View className="flex-row justify-end bg-white px-4">
        <TouchableOpacity
          onPress={() => {
            router.push('/(root)/(editProfile)/editProfile')
          }}
          activeOpacity={0.8}>
          <Ionicons name="menu" size={32} color="#353949" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={Platform.OS === 'web' ? true : false}
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View className="items-center border-b border-gray-200 bg-white p-5">
          <TouchableOpacity
            className="mb-4 h-32 w-32 items-center justify-center rounded-full bg-gray-100"
            onPress={() => {
              if (Platform.OS === 'web') {
                selectImage()
              } else {
                showImageOptions()
              }
            }}>
            {session?.user.image ? (
              <Image
                source={{ uri: session?.user.image as string }}
                className="h-full w-full rounded-full"
              />
            ) : (
              <Ionicons name="person-circle" size={100} color="#353949" />
            )}
          </TouchableOpacity>

          <View className="flex flex-row items-center mb-2 space-x-2">
            <Text className="text-2xl font-bold text-gray-800">{session?.user.name}</Text>
            {session?.user.emailVerified && (
              <Ionicons
                name="shield-checkmark-sharp"
                size={16}
                color="#353949"
                style={{ paddingTop: 2 }}
              />
            )}
          </View>

          {/* @ts-ignore */}
          <Text className="text-base text-gray-600">{session.user.username}</Text>
        </View>

        <View className="p-5 h-full bg-white">
          <View className="flex flex-row justify-between mb-4">
            <TouchableOpacity
              className="w-[48%] h-16 flex-row items-center justify-center rounded-md bg-darkBlue p-4"
              onPress={() => router.push('/(root)/(properties)/publish')}>
              <Ionicons name="pencil-outline" size={24} color="white" />
              <Text className="px-2 text-base font-semibold text-white">Publish</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="w-[48%] h-16 flex-row items-center justify-center rounded-md bg-darkBlue p-4"
              onPress={() => router.push({ pathname: '/(root)/(properties)/myProperties' })}>
              <Ionicons name="home-outline" size={24} color="white" />
              <Text className="px-2 text-base font-semibold text-white">My Properties</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

export default ProfilePage
