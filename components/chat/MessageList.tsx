import { memo, useCallback, useEffect } from 'react'
import { FlatList, ListRenderItemInfo } from 'react-native'

import { socketService } from '../../lib/socket'
import { MessageBubble } from './MessageBubble'

export type Message = {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp?: number
}

type MessageListProps = {
  messages: Message[]
  flatListRef: React.RefObject<FlatList<Message> | null>
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

  const renderItem = useCallback(({ item }: ListRenderItemInfo<Message>) => {
    const isUser = item.sender === 'user'
    return <MessageBubble text={item.text} isUser={isUser} />
  }, [])

  const handleEndReached = useCallback(() => {
    if (!isLoading && hasMoreMessages) {
      onLoadMore()
    }
  }, [isLoading, hasMoreMessages, onLoadMore])

  const keyExtractor = useCallback((item: Message) => item.id, [])

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
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
