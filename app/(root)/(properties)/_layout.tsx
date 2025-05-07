import { Text, TouchableOpacity } from 'react-native'

import { Stack, router } from 'expo-router'

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="publish"
        options={{
          headerShown: true,
          animation: 'ios_from_left',
          headerTitleAlign: 'center',
          headerTitle: 'Place your advert'
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
        name="operationType"
        options={{
          animation: 'slide_from_bottom',
          headerTitleAlign: 'center',
          headerTitle: 'Select Operation Type',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() =>
                router.replace({
                  pathname: '/(root)/(properties)/publish'
                })
              }>
              <Text className="px-4 text-lg text-blue-500">Cancel</Text>
            </TouchableOpacity>
          )
        }}
      />
      <Stack.Screen
        name="maps"
        options={{
          animation: 'slide_from_bottom'
        }}
      />
    </Stack>
  )
}
