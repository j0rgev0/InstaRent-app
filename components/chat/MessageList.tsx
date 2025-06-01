import { useEffect } from 'react'
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
  onNewMessage: (message: Message) => void
  currentUserId: string
}

export function MessageList({
  messages,
  flatListRef,
  onNewMessage,
  currentUserId
}: MessageListProps) {
  useEffect(() => {
    socketService.connect(currentUserId)

    socketService.onMessage((message) => {
      onNewMessage({
        id: message.id,
        text: message.text,
        sender: message.sender === currentUserId ? 'user' : 'bot',
        timestamp: message.timestamp
      })
    })

    return () => {
      socketService.disconnect()
    }
  }, [currentUserId])

  const renderItem = ({ item }: ListRenderItemInfo<Message>) => {
    const isUser = item.sender === 'user'
    return <MessageBubble text={item.text} isUser={isUser} />
  }

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 10, paddingBottom: 10 }}
      keyboardShouldPersistTaps="handled"
    />
  )
}
