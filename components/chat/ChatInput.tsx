import { useEffect, useState } from 'react'
import { Text, TextInput, TouchableOpacity, View } from 'react-native'
import { socketService } from '../../lib/socket'

type ChatInputProps = {
  value: string
  onChangeText: (text: string) => void
  onSend: () => void
  currentUserId: string
  receiverId: string
}

export function ChatInput({
  value,
  onChangeText,
  onSend,
  currentUserId,
  receiverId
}: ChatInputProps) {
  const [isTyping, setIsTyping] = useState(false)
  let typingTimeout: NodeJS.Timeout

  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout)
      }
    }
  }, [])

  const handleTextChange = (text: string) => {
    onChangeText(text)

    if (!isTyping) {
      setIsTyping(true)
      socketService.emitTyping(true)
    }

    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }

    typingTimeout = setTimeout(() => {
      setIsTyping(false)
      socketService.emitTyping(false)
    }, 1000)
  }

  const handleSend = () => {
    if (value.trim()) {
      onSend()
    }
  }

  return (
    <View className="flex-row px-2.5 pb-10 py-2 border-t border-gray-300 bg-white">
      <TextInput
        className="flex-1 bg-gray-200 rounded-full px-4 text-base h-10"
        placeholder="Escribe un mensaje..."
        placeholderTextColor="#999"
        value={value}
        onChangeText={handleTextChange}
        onSubmitEditing={handleSend}
        returnKeyType="send"
      />
      <TouchableOpacity
        onPress={handleSend}
        className="bg-darkBlue rounded-full px-4 justify-center ml-2">
        <Text className="text-white font-bold">Enviar</Text>
      </TouchableOpacity>
    </View>
  )
}
