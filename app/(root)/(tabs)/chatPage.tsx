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
import { socketService } from '@/lib/socket'
import { INSTARENT_API_KEY, INSTARENT_API_URL } from '@/utils/constants'

import '@/global.css'

type User = {
  id: string
  name: string
  image: string | null
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
  const [chats, setChats] = useState<ChatRoom[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  const userId = session?.user.id

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

    socketService.connect(userId)

    const handleNewMessage = async (data: any) => {
      if (!data || !data.message || !data.senderId || !data.receiverId) {
        return
      }

      const roomId = [data.senderId, data.receiverId].sort().join('-')
      socketService.joinRoom(roomId)

      await fetchUserChatRooms()
    }

    socketService.onMessage(handleNewMessage)

    chats.forEach((chat) => {
      const roomId = [chat.senderId, chat.receiverId].sort().join('-')
      socketService.joinRoom(roomId)
    })

    return () => {
      socketService.disconnect()
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

  const handleChatPress = (chatRoom: ChatRoom) => {
    const otherUserId = chatRoom.senderId === userId ? chatRoom.receiverId : chatRoom.senderId
    router.push({
      pathname: '/(root)/(chat)/chat',
      params: {
        propertyOwner: otherUserId
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
              return (
                <TouchableOpacity
                  key={chatRoom.roomId}
                  onPress={() => handleChatPress(chatRoom)}
                  className="border-b border-gray-200 p-4">
                  <View className="flex-row items-center">
                    <View className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 mr-3">
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
                        <Text className="text-lg font-semibold text-darkBlue">
                          {otherUser.name}
                        </Text>
                        {isUnread && <View className="w-2.5 h-2.5 rounded-full bg-darkBlue" />}
                      </View>
                      <Text className="text-sm text-gray-500" numberOfLines={1}>
                        {chatRoom.message}
                      </Text>
                      <Text className="text-xs text-gray-400">
                        {formatMessageTime(chatRoom.createdAt)}
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
