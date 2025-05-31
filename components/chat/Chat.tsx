import { Colors } from '@/constants/Colors'
import { useColorScheme } from '@/hooks/useColorScheme'
import { useThemeColor } from '@/hooks/useThemeColor'
import { useState } from 'react'
import { FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { ThemedText } from '../ThemedText'
import { ThemedView } from '../ThemedView'
import { IconSymbol } from '../ui/IconSymbol'

type Message = {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const theme = useColorScheme() ?? 'light'
  const backgroundColor = useThemeColor({}, 'background')
  const tintColor = useThemeColor({}, 'tint')
  const textColor = useThemeColor({}, 'text')

  const sendMessage = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText.trim(),
        isUser: true,
        timestamp: new Date()
      }
      setMessages((prev) => [...prev, newMessage])
      setInputText('')
    }
  }

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.isUser ? styles.userMessage : styles.otherMessage]}>
      <ThemedView
        style={[styles.messageBubble, item.isUser ? styles.userBubble : styles.otherBubble]}>
        <ThemedText style={styles.messageText}>{item.text}</ThemedText>
        <ThemedText style={styles.timestamp}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </ThemedText>
      </ThemedView>
    </View>
  )

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        inverted={false}
      />
      <View style={[styles.inputContainer, { backgroundColor }]}>
        <TextInput
          style={[styles.input, { color: textColor }]}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor={Colors[theme].icon}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: tintColor }]}
          onPress={sendMessage}
          disabled={!inputText.trim()}>
          <IconSymbol name="arrow.up.circle.fill" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  messagesList: {
    padding: 16
  },
  messageContainer: {
    marginVertical: 4,
    maxWidth: '80%'
  },
  userMessage: {
    alignSelf: 'flex-end'
  },
  otherMessage: {
    alignSelf: 'flex-start'
  },
  messageBubble: {
    padding: 12,
    borderRadius: 20,
    maxWidth: '100%'
  },
  userBubble: {
    backgroundColor: '#0a7ea4',
    borderBottomRightRadius: 4
  },
  otherBubble: {
    backgroundColor: '#f0f0f0',
    borderBottomLeftRadius: 4
  },
  messageText: {
    fontSize: 16,
    color: '#fff'
  },
  timestamp: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
    alignSelf: 'flex-end'
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'flex-end'
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingRight: 40,
    maxHeight: 100,
    marginRight: 8
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  }
})
