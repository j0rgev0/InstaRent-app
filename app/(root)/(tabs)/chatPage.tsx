import React, { useCallback, useEffect, useState } from 'react'
import {
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useFocusEffect, useRouter } from 'expo-router'

import { authClient } from '@/lib/auth-client'
import { useSocket } from '@/lib/socket'
import { INSTARENT_API_KEY, INSTARENT_API_URL } from '@/utils/constants'

import '@/global.css'
import { Property } from '@/utils/types'
import { Ionicons } from '@expo/vector-icons'

type User = {
  id: string
  name: string
  username: string
  image: string | null
  emailVerified: boolean
  displayUsername: string
}

type ChatRoom = {
  roomId: string
  senderId: string
  receiverId: string
  sender: User
  receiver: User
  message: string
  createdAt: string
  read: boolean
}

const ChatPage = () => {
  const { data: session } = authClient.useSession()
  const socket = useSocket()

  const userId = session?.user.id

  const [chats, setChats] = useState<ChatRoom[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [properties, setProperties] = useState<Map<string, Property>>(new Map())
  const router = useRouter()

  const fetchUserChatRooms = async () => {
    try {
      const url = `${INSTARENT_API_URL}/chat/rooms/${userId}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${INSTARENT_API_KEY}`
        }
      })

      const responseText = await response.text()

      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError)
        console.error('Response Text:', responseText)
        throw new Error('Invalid JSON response from server')
      }

      if (!response.ok) {
        throw new Error(data.error || 'Error getting chat rooms')
      }

      if (!Array.isArray(data)) {
        console.error('Unexpected data format:', data)
        throw new Error('Invalid data format received from server')
      }

      const validChats = data.filter((chat: any) => {
        const isValid =
          chat &&
          typeof chat.roomId === 'string' &&
          typeof chat.senderId === 'string' &&
          typeof chat.receiverId === 'string' &&
          chat.sender &&
          chat.receiver &&
          typeof chat.sender.name === 'string' &&
          typeof chat.receiver.name === 'string' &&
          typeof chat.message === 'string' &&
          typeof chat.createdAt === 'string' &&
          typeof chat.read === 'boolean'

        if (!isValid) {
          console.warn('Invalid chat room data:', chat)
        }
        return isValid
      })

      const sortedChats = validChats.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )

      setChats(sortedChats)
    } catch (error) {
      console.error('Error fetching chat rooms:', error)
      setChats([])
    }
  }

  useEffect(() => {
    if (!userId) return

    const handleNewMessage = async (data: any) => {
      if (!data || !data.message || !data.senderId || !data.receiverId) {
        return
      }

      const roomId = data.roomid
      socket.joinRoom(roomId)

      await fetchUserChatRooms()
    }

    socket.onMessage(handleNewMessage)

    chats.forEach((chat) => {
      const roomId = chat.roomId
      socket.joinRoom(roomId)
    })

    return () => {
      socket.removeHandler('receive_message', handleNewMessage)
    }
  }, [userId, chats])

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchUserChatRooms()
    setRefreshing(false)
  }

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('dark-content', true)

      if (Platform.OS === 'web') {
        document.title = 'Chats'
      }

      if (userId) {
        fetchUserChatRooms()
      }
    }, [userId])
  )

  const handleChatPress = async (chatRoom: ChatRoom) => {
    const otherUserId = chatRoom.senderId === userId ? chatRoom.receiverId : chatRoom.senderId

    if (!chatRoom.read && chatRoom.receiverId === userId) {
      try {
        await fetch(`${INSTARENT_API_URL}/chat/read/${chatRoom.roomId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${INSTARENT_API_KEY}`
          }
        })

        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.roomId === chatRoom.roomId ? { ...chat, read: true } : chat
          )
        )
      } catch (error) {
        console.error('Error marking messages as read:', error)
      }
    }

    router.push({
      pathname: '/(root)/(chat)/chat',
      params: {
        propertyOwner: otherUserId,
        roomChatID: chatRoom.roomId
      }
    })
  }

  const getOtherUser = (chatRoom: ChatRoom) => {
    return chatRoom.senderId === userId ? chatRoom.receiver : chatRoom.sender
  }

  const formatMessageTime = (dateString: string) => {
    const messageDate = new Date(dateString)
    const today = new Date()

    if (messageDate.toDateString() === today.toDateString()) {
      return messageDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    return messageDate.toLocaleDateString([], {
      month: 'short',
      day: 'numeric'
    })
  }

  const fetchProperty = async (propertyId: string) => {
    if (!propertyId) return
    try {
      const response = await fetch(`${INSTARENT_API_URL}/properties/${propertyId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${INSTARENT_API_KEY}`
        }
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Error getting property')

      setProperties((prev) => new Map(prev).set(propertyId, data))
    } catch (error) {
      console.error('Error getting property', error)
    }
  }

  useEffect(() => {
    chats.forEach((chatRoom) => {
      const [propertyId] = chatRoom.roomId.split('::')
      if (propertyId && !properties.has(propertyId)) {
        fetchProperty(propertyId)
      }
    })
  }, [chats])

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1">
        <ScrollView
          className="flex-1"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          {chats.length === 0 ? (
            <View className="flex-1 items-center justify-center p-4">
              <Text className="text-gray-500 text-center">
                You have no active conversations. Start chatting with property owners!
              </Text>
            </View>
          ) : (
            chats.map((chatRoom) => {
              const otherUser = getOtherUser(chatRoom)
              const isUnread = !chatRoom.read && chatRoom.receiverId === userId
              const [propertyId] = chatRoom.roomId.split('::')
              const property = properties.get(propertyId)

              return (
                <TouchableOpacity
                  key={chatRoom.roomId}
                  onPress={() => handleChatPress(chatRoom)}
                  className="border-b border-gray-200 p-4">
                  <View className="flex-row items-center">
                    <View className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 mr-3">
                      {otherUser.image ? (
                        <Image
                          source={{ uri: otherUser.image }}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="w-full h-full items-center justify-center bg-gray-300">
                          <Text className="text-xl text-gray-600">
                            {otherUser.name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between">
                        <View className="flex flex-row items-center mb-2 space-x-2">
                          <Text className="text-xl font-semibold text-darkBlue">
                            {otherUser.name}
                          </Text>
                          {otherUser.emailVerified && (
                            <Ionicons name="shield-checkmark-sharp" size={12} color="#353949" />
                          )}
                        </View>
                        <Text
                          className={`text-base ${isUnread ? 'text-darkBlue font-semibold' : 'text-gray-400'} `}>
                          {formatMessageTime(chatRoom.createdAt)}
                        </Text>
                      </View>

                      <View className="flex-row items-center justify-between">
                        <Text
                          className={`text-lg ${isUnread ? 'text-darkBlue font-semibold' : 'text-gray-400'} `}
                          numberOfLines={1}>
                          {chatRoom.message}
                        </Text>
                        {isUnread && <View className="w-3 h-3 rounded-full bg-darkBlue" />}
                      </View>
                      <Text className="text-sm text-gray-400">
                        <Text className="capitalize">{property?.type} </Text>
                        on
                        <Text className="capitalize">
                          {' '}
                          {property?.street} {property?.street_number}, {property?.locality}
                        </Text>
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )
            })
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

export default ChatPage
