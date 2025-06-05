import { ChatInput } from '@/components/chat/ChatInput'
import { MessageList, type Message } from '@/components/chat/MessageList'
import { authClient } from '@/lib/auth-client'
import { useSocket } from '@/lib/socket'
import { INSTARENT_API_KEY, INSTARENT_API_URL } from '@/utils/constants'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  View
} from 'react-native'

const MESSAGES_PER_PAGE = 20

type MessageGroup = {
  date: string
  messages: Message[]
}

export default function ChatScreen() {
  const { propertyOwner, roomChatID } = useLocalSearchParams<{
    propertyOwner: string
    roomChatID: string
  }>()
  const { data: session } = authClient.useSession()
  const currentUserId = session?.user?.id
  const socket = useSocket()
  const navigation = useNavigation()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasMoreMessages, setHasMoreMessages] = useState(true)
  const [page, setPage] = useState(1)
  const flatListRef = useRef<FlatList<MessageGroup> | null>(null)

  const fetchMessages = async (pageNum: number) => {
    if (!currentUserId || !roomChatID) return

    try {
      setIsLoading(true)
      const response = await fetch(`${INSTARENT_API_URL}/chat/${roomChatID}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${INSTARENT_API_KEY}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }

      const data = await response.json()

      if (!Array.isArray(data)) {
        throw new Error('Invalid response format')
      }

      const formattedMessages: Message[] = data.map((msg: any) => ({
        id: msg.id,
        text: msg.message,
        sender: msg.senderId === currentUserId ? 'user' : 'bot',
        timestamp: new Date(msg.createdAt).getTime()
      }))

      if (pageNum === 1) {
        setMessages(formattedMessages)
      } else {
        setMessages((prev) => [...prev, ...formattedMessages])
      }

      setHasMoreMessages(data.length === MESSAGES_PER_PAGE)
    } catch (error) {
      console.error('Error fetching messages:', error)
      Alert.alert('Error', 'Failed to load messages')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (currentUserId && roomChatID) {
      fetchMessages(1)
      socket.joinRoom(roomChatID)
    }
  }, [currentUserId, roomChatID])

  useEffect(() => {
    if (!currentUserId || !roomChatID) return

    const handleNewMessage = (data: any) => {
      if (!data || !data.message || !data.senderId || !data.receiverId) return

      const newMessage: Message = {
        id: data.id || Date.now().toString(),
        text: data.message,
        sender: data.senderId === currentUserId ? 'user' : 'bot',
        timestamp: new Date(data.createdAt).getTime()
      }

      setMessages((prev) => [newMessage, ...prev])
    }

    socket.onMessage(handleNewMessage)

    return () => {
      socket.removeHandler('receive_message', handleNewMessage)
    }
  }, [currentUserId, roomChatID])

  const handleLoadMore = () => {
    if (!isLoading && hasMoreMessages) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchMessages(nextPage)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || !currentUserId || !propertyOwner || !roomChatID) return

    const message = input.trim()
    setInput('')

    try {
      socket.sendMessage({
        roomId: roomChatID,
        senderId: currentUserId,
        receiverId: propertyOwner,
        message
      })
    } catch (error) {
      console.error('Error sending message:', error)
      Alert.alert('Error', 'Failed to send message')
    }
  }

  useLayoutEffect(() => {
    if (Platform.OS === 'web') {
      document.title = 'Chat'
    }
  }, [])

  if (!currentUserId || !propertyOwner || !roomChatID) {
    return null
  }

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
            onLoadMore={handleLoadMore}
            isLoading={isLoading}
            hasMoreMessages={hasMoreMessages}
            currentUserId={currentUserId}
          />
          <ChatInput
            value={input}
            onChangeText={setInput}
            onSend={sendMessage}
            currentUserId={currentUserId}
            receiverId={propertyOwner}
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}
