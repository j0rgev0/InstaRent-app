import { ChatInput } from '@/components/chat/ChatInput'
import { MessageList, type Message } from '@/components/chat/MessageList'
import { authClient } from '@/lib/auth-client'
import { useSocket } from '@/lib/socket'
import { INSTARENT_API_KEY, INSTARENT_API_URL } from '@/utils/constants'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams, useNavigation } from 'expo-router'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  Alert,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native'

const MESSAGES_PER_PAGE = 20

type MessageGroup = {
  date: string
  messages: Message[]
}

type User = {
  id: string
  name: string
  username: string
  image: string | null
  email: string
  emailVerified: boolean
  displayUsername: string
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
  const [otherUser, setOtherUser] = useState<User | null>(null)
  const [property, setProperty] = useState<any>(null)
  const [showUserInfo, setShowUserInfo] = useState(false)
  const flatListRef = useRef<FlatList<MessageGroup> | null>(null)

  const [propertyId] = roomChatID ? roomChatID.split('::') : ['']

  const fetchOtherUser = async () => {
    if (!propertyOwner) return

    try {
      const response = await fetch(`${INSTARENT_API_URL}/users/${propertyOwner}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${INSTARENT_API_KEY}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user information')
      }

      const userData = await response.json()
      setOtherUser(userData)
    } catch (error) {
      console.error('Error fetching user information:', error)
    }
  }

  const fetchProperty = async () => {
    if (!propertyId) return
    try {
      const response = await fetch(`${INSTARENT_API_URL}/properties/${propertyId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${INSTARENT_API_KEY}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch property')
      }

      const data = await response.json()
      setProperty(data)
    } catch (error) {
      console.error('Error fetching property:', error)
    }
  }

  useEffect(() => {
    fetchOtherUser()
  }, [propertyOwner])

  useEffect(() => {
    if (propertyId) {
      fetchProperty()
    }
  }, [propertyId])

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
      socket.setInChatScreen(true)

      const markMessagesAsRead = async () => {
        try {
          await fetch(`${INSTARENT_API_URL}/chat/read/${roomChatID}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${INSTARENT_API_KEY}`
            },
            body: JSON.stringify({
              userId: currentUserId
            })
          })
          socket.fetchUnreadCount(currentUserId)
        } catch (error) {
          console.error('Error marking messages as read:', error)
        }
      }

      markMessagesAsRead()
    }

    return () => {
      socket.setInChatScreen(false)
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

      if (data.receiverId === currentUserId) {
        fetch(`${INSTARENT_API_URL}/chat/read/${roomChatID}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${INSTARENT_API_KEY}`
          },
          body: JSON.stringify({
            userId: currentUserId
          })
        })
          .then(() => {
            socket.fetchUnreadCount(currentUserId)
          })
          .catch((error) => {
            console.error('Error marking message as read:', error)
          })
      }
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

  const handleViewProperty = () => {
    if (propertyId) {
      router.push({
        pathname: '/(root)/(properties)/propertyView',
        params: { propertyId }
      })
    }
  }

  const handleViewUserInfo = () => {
    if (otherUser) {
      setShowUserInfo(true)
    }
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: otherUser?.name,
      headerTitleAlign: 'center',
      headerLeft: () => (
        <TouchableOpacity onPress={() => router.back()} className="flex flex-row items-center">
          <Ionicons name="chevron-back-sharp" size={32} color={'#3b82f6'} />
          <Text className="text-lg text-blue-500">Back</Text>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={handleViewUserInfo} className="mr-4">
          <Ionicons name="information-circle-outline" size={24} color={'#3b82f6'} />
        </TouchableOpacity>
      )
    })
  }, [navigation, otherUser])

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
        <View className="flex-1">
          {property && (
            <TouchableOpacity
              onPress={handleViewProperty}
              className="bg-gray-50 border-b border-gray-200 px-4 py-2">
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-darkBlue capitalize">
                    {property.type}
                  </Text>
                  <Text className="text-sm text-gray-600 capitalize">
                    {property.street} {property.street_number}, {property.locality}
                  </Text>
                </View>

                <Text className="text-base font-semibold text-darkBlue">
                  {property.operation === 'rent'
                    ? `${Number(property.price).toLocaleString('es-ES')} €/mes`
                    : `${Number(property.price).toLocaleString('es-ES')} €`}
                </Text>
              </View>
            </TouchableOpacity>
          )}
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
        </View>
      </TouchableWithoutFeedback>

      <Modal
        visible={showUserInfo}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUserInfo(false)}>
        <TouchableWithoutFeedback onPress={() => setShowUserInfo(false)}>
          <View className="flex-1 justify-center items-center bg-black/50">
            <TouchableWithoutFeedback>
              <View className="bg-white rounded-lg p-6 m-4 w-[80%]">
                <View className="items-center mb-4">
                  {otherUser?.image ? (
                    <Image
                      source={{ uri: otherUser.image }}
                      className="w-20 h-20 rounded-full mb-2"
                    />
                  ) : (
                    <View className="w-20 h-20 rounded-full bg-gray-200 items-center justify-center mb-2">
                      <Text className="text-2xl text-gray-600">
                        {otherUser?.name?.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View className="flex-row items-center">
                    <Text className="text-xl font-semibold text-darkBlue">{otherUser?.name}</Text>
                    {otherUser?.emailVerified && (
                      <Ionicons name="shield-checkmark-sharp" size={16} color="#353949" />
                    )}
                  </View>
                  <Text className="text-gray-600">@{otherUser?.username}</Text>
                  <Text className="text-gray-600 mt-1">{otherUser?.email}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowUserInfo(false)}
                  className="absolute top-2 right-2">
                  <Ionicons name="close" size={24} color="#353949" />
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </KeyboardAvoidingView>
  )
}
