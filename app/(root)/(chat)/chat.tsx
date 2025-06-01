import { ChatInput } from '@/components/chat/ChatInput'
import { MessageList, type Message } from '@/components/chat/MessageList'
import { authClient } from '@/lib/auth-client'
import { useNavigation } from 'expo-router'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  View
} from 'react-native'

export default function ChatScreen() {
  const navigation = useNavigation()

  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hola, ¿en qué puedo ayudarte?', sender: 'bot' },
    { id: '2', text: '¡Hola! Quiero saber más sobre su propiedad.', sender: 'user' }
  ])

  const [input, setInput] = useState('')
  const flatListRef = useRef<FlatList<Message>>(null)
  const currentUserId = 'user'
  const receiverId = 'bot'

  const handleNewMessage = (message: Message) => {
    setMessages((prevMessages) => [...prevMessages, message])
  }

  const sendMessage = () => {
    if (input.trim() === '') return
    const newMessage: Message = {
      id: (messages.length + 1).toString(),
      text: input,
      sender: 'user'
    }
    setMessages([...messages, newMessage])
    setInput('')
  }

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true })
      }, 100)
    }
  }, [messages])

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitleAlign: 'center',
      headerTitle: 'Chat'
    })
  }, [navigation])

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}>
      <TouchableWithoutFeedback onPress={Platform.OS !== 'web' ? Keyboard.dismiss : undefined}>
        <View className="flex-1 justify-end">
          <MessageList
            messages={messages}
            flatListRef={flatListRef}
            onNewMessage={handleNewMessage}
            currentUserId={currentUserId}
          />
          <ChatInput
            value={input}
            onChangeText={setInput}
            onSend={sendMessage}
            currentUserId={currentUserId}
            receiverId={receiverId}
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}
