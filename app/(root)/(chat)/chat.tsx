import { Chat } from '@/components/chat/Chat'
import { ThemedView } from '@/components/ThemedView'
import { StyleSheet } from 'react-native'

export default function ChatScreen() {
  return (
    <ThemedView style={styles.container}>
      <Chat />
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
})
