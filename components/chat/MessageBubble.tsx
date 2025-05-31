import { Text, View } from 'react-native'

type MessageBubbleProps = {
  text: string
  isUser: boolean
}

export function MessageBubble({ text, isUser }: MessageBubbleProps) {
  return (
    <View
      style={{
        maxWidth: '75%',
        marginVertical: 5,
        borderRadius: 12,
        borderBottomRightRadius: isUser ? 0 : 12,
        borderBottomLeftRadius: !isUser ? 0 : 12
      }}
      className={`p-2.5 ${isUser ? 'bg-darkBlue self-end' : 'bg-gray-200 self-start'}`}>
      <Text className={`text-base ${isUser ? 'text-white' : 'text-darkBlue'}`}>{text}</Text>
    </View>
  )
}
