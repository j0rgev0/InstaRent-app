import { Ionicons } from '@expo/vector-icons'
import { router, Stack } from 'expo-router'
import { Text, TouchableOpacity } from 'react-native'

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="publish"
        options={{
          headerShown: true,
          animation: 'ios_from_left',
          headerTitleAlign: 'center',
          headerTitle: 'Place your advert',
          headerLeft: () => ''
        }}
      />

      <Stack.Screen
        name="selectType"
        options={{
          animation: 'slide_from_bottom',
          headerTitleAlign: 'center',
          headerTitle: 'Select Housing Type'
        }}
      />

      <Stack.Screen
        name="conservation"
        options={{
          animation: 'slide_from_bottom',
          headerTitleAlign: 'center',
          headerTitle: 'Select Condition'
        }}
      />

      <Stack.Screen
        name="operationType"
        options={{
          animation: 'slide_from_bottom',
          headerTitleAlign: 'center',
          headerTitle: 'Select Operation Type'
        }}
      />

      <Stack.Screen
        name="maps"
        options={{
          animation: 'slide_from_bottom'
        }}
      />

      <Stack.Screen
        name="addPictures"
        options={{
          animation: 'none',
          headerTitleAlign: 'center',
          headerTitle: 'Pictures & Features',
          headerLeft: () => ''
        }}
      />

      <Stack.Screen
        name="myProperties"
        options={{
          animation: 'none',
          headerTitleAlign: 'center',
          headerTitle: 'My Properties',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="flex flex-row items-center">
              <Ionicons name="chevron-back-sharp" size={32} color={'#3b82f6'} />
              <Text className="text-lg text-blue-500">Back</Text>
            </TouchableOpacity>
          )
        }}
      />

      <Stack.Screen
        name="propertyView"
        options={{
          animation: 'none',
          headerTitleAlign: 'center',
          headerTitle: 'Property Details',
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
