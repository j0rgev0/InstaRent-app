import { Platform, StyleSheet, View } from 'react-native'

import { BlurView } from 'expo-blur'
import { Tabs } from 'expo-router'

import { Ionicons } from '@expo/vector-icons'

export default function RootLayout() {
  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#353949',
          tabBarStyle: styles.tab
        }}>
        <Tabs.Screen
          name="home"
          options={{
            tabBarLabel: '',
            headerShown: false,
            tabBarIcon: ({ size, focused }) => (
              <Ionicons name={focused ? 'home' : 'home-outline'} color={'#353949'} size={size} />
            )
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarLabel: '',
            headerShown: false,
            tabBarIcon: ({ size, focused }) => (
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                color={'#353949'}
                size={size}
              />
            )
          }}
        />
      </Tabs>
      {Platform.OS !== 'web' && (
        <BlurView intensity={Platform.OS === 'ios' ? 10 : 50} style={styles.blur} tint="light" />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  tab: {
    backgroundColor: Platform.OS !== 'android' ? 'transparent' : 'rgba(255, 255, 255, 0.8)',
    position: 'absolute',
    borderRadius: 30,
    paddingTop: 10,
    height: 80,
    borderColor: 'rgba(255, 255, 255, 0)',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
    elevation: 5,
    bottom: 0,
    backdropFilter: 'blur(4px)',
    zIndex: 1
  },
  blur: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 30,
    overflow: 'hidden',
    zIndex: 0
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end'
  }
})
