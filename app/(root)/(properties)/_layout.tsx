import { Ionicons } from '@expo/vector-icons'
import { router, Stack } from 'expo-router'
import { Text, TouchableOpacity } from 'react-native'

export default function PropertiesLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitleAlign: 'center',
        animation: 'slide_from_right'
      }}>
      <Stack.Screen
        name="publish"
        options={{
          headerShown: true,
          headerTitle: 'Place your advert',
          headerLeft: () => ''
        }}
      />

      <Stack.Screen
        name="selectType"
        options={{
          headerTitle: 'Select Housing Type',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="flex flex-row items-center">
              <Ionicons name="chevron-back-sharp" size={32} color={'#3b82f6'} />
              <Text className="text-lg text-blue-500">Back</Text>
            </TouchableOpacity>
          )
        }}
      />

      <Stack.Screen
        name="conservation"
        options={{
          headerTitle: 'Select Condition',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="flex flex-row items-center">
              <Ionicons name="chevron-back-sharp" size={32} color={'#3b82f6'} />
              <Text className="text-lg text-blue-500">Back</Text>
            </TouchableOpacity>
          )
        }}
      />

      <Stack.Screen
        name="operationType"
        options={{
          headerTitle: 'Select Operation Type',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="flex flex-row items-center">
              <Ionicons name="chevron-back-sharp" size={32} color={'#3b82f6'} />
              <Text className="text-lg text-blue-500">Back</Text>
            </TouchableOpacity>
          )
        }}
      />

      <Stack.Screen
        name="maps"
        options={{
          headerTitle: 'Select Location',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="flex flex-row items-center">
              <Ionicons name="chevron-back-sharp" size={32} color={'#3b82f6'} />
              <Text className="text-lg text-blue-500">Back</Text>
            </TouchableOpacity>
          )
        }}
      />

      <Stack.Screen
        name="addPictures"
        options={{
          headerTitle: 'Pictures & Features',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="flex flex-row items-center">
              <Ionicons name="chevron-back-sharp" size={32} color={'#3b82f6'} />
              <Text className="text-lg text-blue-500">Back</Text>
            </TouchableOpacity>
          )
        }}
      />

      <Stack.Screen
        name="myProperties"
        options={{
          headerTitle: 'My Properties',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="flex flex-row items-center">
              <Ionicons name="chevron-back-sharp" size={32} color={'#3b82f6'} />
              <Text className="text-lg text-blue-500">Back</Text>
            </TouchableOpacity>
          )
        }}
      />
    </Stack>
  )
}
