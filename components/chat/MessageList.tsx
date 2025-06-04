import { memo, useCallback, useEffect } from 'react'
import { FlatList, ListRenderItemInfo, Text, View } from 'react-native'

import { socketService } from '../../lib/socket'
import { MessageBubble } from './MessageBubble'

export type Message = {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp?: number
}

type MessageGroup = {
  date: string
  messages: Message[]
}

type MessageListProps = {
  messages: Message[]
  flatListRef: React.RefObject<FlatList<MessageGroup> | null>
  onLoadMore: () => void
  isLoading: boolean
  hasMoreMessages: boolean
  currentUserId: string
}

const MessageList = memo(function MessageList({
  messages,
  flatListRef,
  onLoadMore,
  isLoading,
  hasMoreMessages,
  currentUserId
}: MessageListProps) {
  useEffect(() => {
    socketService.connect(currentUserId)

    return () => {
      socketService.disconnect()
    }
  }, [currentUserId])

  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true })
    }
  }, [messages.length])

  const formatDate = (timestamp: number) => {
    const messageDate = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Hoy'
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Ayer'
    } else {
      return messageDate.toLocaleDateString([], {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: undefined
    })
  }

  const groupMessagesByDate = useCallback((messages: Message[]): MessageGroup[] => {
    const groups: { [key: string]: Message[] } = {}

    messages.forEach((message) => {
      if (!message.timestamp) return

      const date = new Date(message.timestamp).toDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
    })

    Object.keys(groups).forEach((date) => {
      groups[date].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
    })

    return Object.entries(groups)
      .map(([date, messages]) => ({
        date: formatDate(new Date(date).getTime()),
        messages
      }))
      .sort((a, b) => {
        const dateA = new Date(a.messages[0]?.timestamp || 0)
        const dateB = new Date(b.messages[0]?.timestamp || 0)
        return dateB.getTime() - dateA.getTime()
      })
  }, [])

  const renderItem = useCallback(({ item }: ListRenderItemInfo<MessageGroup>) => {
    return (
      <View className="mb-4">
        <View className="items-center mb-4">
          <View className="bg-gray-200 px-4 py-1 rounded-full">
            <Text className="text-gray-600 text-sm">{item.date}</Text>
          </View>
        </View>
        {item.messages.map((message) => (
          <MessageBubble
            key={message.id}
            text={message.text}
            timestamp={message.timestamp ? formatTime(message.timestamp) : ''}
            isUser={message.sender === 'user'}
          />
        ))}
      </View>
    )
  }, [])

  const handleEndReached = useCallback(() => {
    if (!isLoading && hasMoreMessages) {
      onLoadMore()
    }
  }, [isLoading, hasMoreMessages, onLoadMore])

  const keyExtractor = useCallback((item: MessageGroup) => item.date, [])

  const groupedMessages = groupMessagesByDate(messages)

  return (
    <FlatList
      ref={flatListRef}
      data={groupedMessages}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 10, paddingBottom: 10 }}
      keyboardShouldPersistTaps="handled"
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      inverted
      showsVerticalScrollIndicator={false}
    />
  )
})

export { MessageList }
