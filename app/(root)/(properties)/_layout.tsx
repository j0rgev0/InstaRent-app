import { Stack } from 'expo-router'

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
          animation: 'slide_from_bottom',
          headerTitleAlign: 'center',
          headerTitle: 'Add Pctures'
        }}
      />
    </Stack>
  )
}
