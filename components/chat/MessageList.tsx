import { memo, useCallback } from 'react'
import { FlatList, ListRenderItemInfo, Text, View } from 'react-native'

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
  currentUserId: string | undefined
}

const MessageList = memo(function MessageList({
  messages,
  flatListRef,
  onLoadMore,
  isLoading,
  hasMoreMessages,
  currentUserId
}: MessageListProps) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }
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
