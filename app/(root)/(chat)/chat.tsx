import { ChatInput } from '@/components/chat/ChatInput'
import { MessageList, type Message } from '@/components/chat/MessageList'
import { authClient } from '@/lib/auth-client'
import { socketService } from '@/lib/socket'
import { INSTARENT_API_KEY, INSTARENT_API_URL } from '@/utils/constants'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  View
} from 'react-native'

export default function ChatScreen() {
  const { data: session, isPending: isSessionLoading } = authClient.useSession()
  const navigation = useNavigation()
  const params = useLocalSearchParams()
  const propertyOwner = params.propertyOwner as string
  const [ownerName, setOwnerName] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const flatListRef = useRef<FlatList<Message>>(null)
  const currentUserId = session?.user?.id
  const receiverId = propertyOwner

  useEffect(() => {
    const fetchOwnerName = async () => {
      try {
        const response = await fetch(`${INSTARENT_API_URL}/users/${propertyOwner}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${INSTARENT_API_KEY}`
          }
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Error getting user')
        }

        setOwnerName(data.name)
      } catch (error) {
        console.error('Error fetching owner name:', error)
      }
    }

    if (propertyOwner) {
      fetchOwnerName()
    }
  }, [propertyOwner])

  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentUserId) return

      try {
        const response = await fetch(
          `${INSTARENT_API_URL}/chat/${[currentUserId, propertyOwner].sort().join('-')}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${INSTARENT_API_KEY}`
            }
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Error fetching messages')
        }

        // Transform backend messages to frontend format
        const formattedMessages = data.map((msg: any) => ({
          id: msg.id.toString(),
          text: msg.message,
          sender: msg.senderId === currentUserId ? 'user' : 'bot',
          timestamp: new Date(msg.createdAt).getTime()
        }))

        setMessages(formattedMessages)
      } catch (error) {
        console.error('Error fetching messages:', error)
      }
    }

    if (propertyOwner && currentUserId) {
      fetchMessages()
    }
  }, [propertyOwner, currentUserId])

  useEffect(() => {
    if (!currentUserId) return

    // Connect to socket with current user ID
    socketService.connect(currentUserId)

    // Join the chat room
    const roomId = [currentUserId, propertyOwner].sort().join('-')
    socketService.joinRoom(roomId)

    // Listen for new messages
    socketService.onMessage((data) => {
      console.log('Received raw socket data:', data) // Log raw data

      // Validate message data
      if (!data || typeof data !== 'object') {
        console.log('Invalid message data received:', data)
        return
      }

      // Validate required fields
      if (!data.message || typeof data.message !== 'string' || data.message.trim() === '') {
        console.log('Received message with no text or empty text, ignoring:', data)
        return
      }

      if (!data.id || !data.senderId || !data.createdAt) {
        console.log('Received message missing required fields, ignoring:', data)
        return
      }

      setMessages((prev) => {
        // 1. Check if this received message corresponds to a temporary message sent by the current user
        const tempMessageIndex = prev.findIndex(
          (msg) =>
            msg.id.startsWith('temp-') && msg.id === data.tempId && data.senderId === currentUserId
        )

        if (tempMessageIndex > -1) {
          console.log(
            'Updating temporary message with tempId:',
            data.tempId,
            'to real ID:',
            data.id
          )
          // Update the temporary message with real data from the backend
          const updatedMessages = [...prev]
          updatedMessages[tempMessageIndex] = {
            id: data.id.toString(),
            text: data.message.trim(),
            sender: data.senderId === currentUserId ? 'user' : 'bot',
            timestamp: new Date(data.createdAt).getTime()
          }
          return updatedMessages
        }

        // 2. Check if message already exists
        const messageExists = prev.some((msg) => msg.id === data.id.toString())
        if (messageExists) {
          console.log('Message with real ID', data.id, 'already exists, ignoring.')
          return prev
        }

        // 3. Add new message
        console.log('Adding new message with ID:', data.id, 'and text:', data.message)
        const newMessage: Message = {
          id: data.id.toString(),
          text: data.message.trim(),
          sender: data.senderId === currentUserId ? 'user' : 'bot',
          timestamp: new Date(data.createdAt).getTime()
        }
        console.log('New message object to be added:', newMessage) // Log the message object before adding
        return [...prev, newMessage]
      })
    })

    // Cleanup on unmount
    return () => {
      socketService.disconnect()
    }
  }, [currentUserId, propertyOwner])

  const handleNewMessage = (message: Message) => {
    setMessages((prevMessages) => [...prevMessages, message])
  }

  const sendMessage = async () => {
    if (input.trim() === '' || !currentUserId) return

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newMessage: Message = {
      id: tempId,
      text: input.trim(),
      sender: 'user',
      timestamp: Date.now()
    }

    // Add message to UI immediately
    setMessages((prev) => [...prev, newMessage])
    setInput('')

    try {
      const roomId = [currentUserId, propertyOwner].sort().join('-')

      // Send message through Socket.IO
      socketService.sendMessage({
        roomId,
        senderId: currentUserId,
        receiverId: propertyOwner,
        message: input.trim(),
        tempId: tempId
      })
    } catch (error) {
      console.error('Error sending message:', error)
      // Remove message from UI if sending failed
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId))
    }
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
      headerTitle: `Chat with ${ownerName}`
    })
  }, [navigation, ownerName])

  if (isSessionLoading || !currentUserId) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    )
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
