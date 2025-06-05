import React from 'react'
import { Text, View } from 'react-native'

type MessageBubbleProps = {
  text: string
  isUser: boolean
  timestamp: string
}

export function MessageBubble({ text, isUser, timestamp }: MessageBubbleProps) {
  return (
    <View
      style={{
        maxWidth: '75%',
        marginVertical: 1,
        borderRadius: 12,
        borderBottomRightRadius: isUser ? 0 : 12,
        borderBottomLeftRadius: !isUser ? 0 : 12
      }}
      className={`p-2.5 ${isUser ? 'bg-darkBlue self-end' : 'bg-gray-200 self-start'}`}>
      <Text className={`text-base ${isUser ? 'text-white' : 'text-darkBlue'}`}>{text}</Text>
      <Text className={`text-xs mt-1 ${isUser ? 'text-gray-300' : 'text-gray-500'}`}>
        {timestamp}
      </Text>
    </View>
  )
}
