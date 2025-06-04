import { ChatInput } from '@/components/chat/ChatInput'
import { MessageList, type Message } from '@/components/chat/MessageList'
import { authClient } from '@/lib/auth-client'
import { socketService } from '@/lib/socket'
import { INSTARENT_API_KEY, INSTARENT_API_URL } from '@/utils/constants'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
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
  const { data: session, isPending: isSessionLoading } = authClient.useSession()
  const navigation = useNavigation()
  const params = useLocalSearchParams()
  const propertyOwner = params.propertyOwner as string

  const [ownerName, setOwnerName] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasMoreMessages, setHasMoreMessages] = useState(true)

  const flatListRef = useRef<FlatList<MessageGroup> | null>(null)
  const currentUserId = session?.user?.id
  const socketInitialized = useRef(false)
  const isInitialLoad = useRef(true)

  const fetchOwnerName = useCallback(async () => {
    try {
      const response = await fetch(`${INSTARENT_API_URL}/users/${propertyOwner}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${INSTARENT_API_KEY}`
        }
      })
      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Error getting user')
      setOwnerName(data.name)
    } catch (error) {
      console.error('Error fetching owner name:', error)
      Alert.alert('Error', 'No se pudo cargar la información del usuario')
    }
  }, [propertyOwner])

  const fetchMessages = useCallback(
    async (page = 1) => {
      if (!currentUserId || isLoading) return

      setIsLoading(true)
      try {
        const response = await fetch(
          `${INSTARENT_API_URL}/chat/${[currentUserId, propertyOwner].sort().join('-')}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${INSTARENT_API_KEY}`
            }
          }
        )
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Error fetching messages')

        const messagesArray = Array.isArray(data) ? data : data.messages || []
        const formattedMessages: Message[] = messagesArray.map((msg: any) => ({
          id: msg.id.toString(),
          text: msg.message.trim(),
          sender: msg.senderId === currentUserId ? 'user' : 'bot',
          timestamp: new Date(msg.createdAt).getTime()
        }))

        setMessages((prev) => {
          const newMessages = page === 1 ? formattedMessages : [...prev, ...formattedMessages]
          return [...new Set(newMessages.map((m) => m.id))]
            .map((id) => newMessages.find((m) => m.id === id)!)
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
        })

        setHasMoreMessages(messagesArray.length === MESSAGES_PER_PAGE)
      } catch (error) {
        console.error('Error fetching messages:', error)
        Alert.alert('Error', 'No se pudieron cargar los mensajes')
      } finally {
        setIsLoading(false)
      }
    },
    [propertyOwner, currentUserId, isLoading]
  )

  useEffect(() => {
    if (propertyOwner) fetchOwnerName()
  }, [fetchOwnerName])

  useEffect(() => {
    if (propertyOwner && currentUserId) fetchMessages(1)
  }, [propertyOwner, currentUserId, fetchMessages])

  useEffect(() => {
    if (!currentUserId || socketInitialized.current) return

    const roomId = [currentUserId, propertyOwner].sort().join('-')
    socketService.connect(currentUserId)
    socketService.joinRoom(roomId)
    socketInitialized.current = true

    const handleNewMessage = (data: any) => {
      if (!data || !data.message || !data.id || !data.senderId || !data.createdAt) {
        console.log('Invalid message data received:', data)
        return
      }

      setMessages((prev) => {
        const existing = prev.find((msg) => msg.id === data.id.toString())
        if (existing) return prev

        return [
          ...prev,
          {
            id: data.id.toString(),
            text: data.message.trim(),
            sender: data.senderId === currentUserId ? ('user' as const) : ('bot' as const),
            timestamp: new Date(data.createdAt).getTime()
          }
        ].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      })
    }

    socketService.onMessage(handleNewMessage)

    return () => {
      socketService.disconnect()
      socketInitialized.current = false
    }
  }, [currentUserId, propertyOwner])

  const handleLoadMore = () => {
    if (!isLoading && hasMoreMessages) {
      const nextPage = Math.floor(messages.length / MESSAGES_PER_PAGE) + 1
      fetchMessages(nextPage)
    }
  }

  const sendMessage = async () => {
    if (input.trim() === '' || !currentUserId) return

    const messageText = input.trim()
    setInput('')

    try {
      const roomId = [currentUserId, propertyOwner].sort().join('-')
      await socketService.sendMessage({
        roomId,
        senderId: currentUserId,
        receiverId: propertyOwner,
        message: messageText
      })
    } catch (error) {
      console.error('Error sending message:', error)
      Alert.alert('Error', 'No se pudo enviar el mensaje')
    }
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitleAlign: 'center',
      headerTitle: `Chat with ${ownerName}`
    })
  }, [navigation, ownerName])

  if (isSessionLoading || !currentUserId) return null

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
