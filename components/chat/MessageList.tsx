import { FlatList, ListRenderItemInfo } from 'react-native'

import { MessageBubble } from './MessageBubble'

export type Message = {
  id: string
  text: string
  sender: 'user' | 'bot'
}

type MessageListProps = {
  messages: Message[]
  flatListRef: React.RefObject<FlatList<Message> | null>
}

export function MessageList({ messages, flatListRef }: MessageListProps) {
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
