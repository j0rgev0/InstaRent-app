import { useEffect, useRef, useState } from 'react'
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
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const inputRef = useRef<TextInput>(null)

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  const handleTextChange = (text: string) => {
    onChangeText(text)

    if (!isTyping) {
      setIsTyping(true)
      socketService.emitTyping(true)
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      socketService.emitTyping(false)
    }, 1000)
  }

  const handleSend = () => {
    if (value.trim()) {
      onSend()
      inputRef.current?.focus()
    }
  }

  const handleKeyPress = (e: any) => {
    if (e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <View className="flex-row px-2.5 pb-10 py-2 border-t border-gray-300 bg-white">
      <TextInput
        ref={inputRef}
        className="flex-1 bg-gray-200 rounded-full px-4 text-base h-10"
        placeholder="Escribe un mensaje..."
        placeholderTextColor="#999"
        value={value}
        onChangeText={handleTextChange}
        onSubmitEditing={handleSend}
        onKeyPress={handleKeyPress}
        returnKeyType="send"
        multiline={false}
        maxLength={1000}
        blurOnSubmit={false}
      />
      <TouchableOpacity
        onPress={handleSend}
        disabled={!value.trim()}
        className={`rounded-full px-4 justify-center ml-2 ${
          value.trim() ? 'bg-darkBlue' : 'bg-gray-300'
        }`}>
        <Text className={`font-bold ${value.trim() ? 'text-white' : 'text-gray-500'}`}>Enviar</Text>
      </TouchableOpacity>
    </View>
  )
}
