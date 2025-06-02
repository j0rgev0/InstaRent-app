import { useEffect, useRef, useState } from 'react'
import {
  Keyboard,
  KeyboardEvent,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
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
  const [isKeyboardVisible, setKeyboardVisible] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const inputRef = useRef<TextInput>(null)

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (event: KeyboardEvent) => {
        setKeyboardVisible(true)
        setKeyboardHeight(event.endCoordinates.height)
      }
    )
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false)
      setKeyboardHeight(0)
    })

    return () => {
      keyboardDidShowListener.remove()
      keyboardDidHideListener.remove()
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

  return (
    <View
      className={`flex-row items-end px-2.5 py-2 border-t border-gray-300 bg-white`}
      style={{
        paddingBottom:
          Platform.OS === 'android'
            ? isKeyboardVisible
              ? keyboardHeight + 25
              : 10
            : !isKeyboardVisible
              ? 10
              : 0
      }}>
      <TextInput
        ref={inputRef}
        className="flex-1 bg-gray-200 rounded-3xl px-4 text-base min-h-[40px] max-h-[100px] py-2"
        placeholder="Escribe un mensaje..."
        placeholderTextColor="#999"
        value={value}
        onChangeText={handleTextChange}
        onSubmitEditing={() => {}}
        returnKeyType="default"
        multiline={true}
        maxLength={1000}
        textAlignVertical="center"
      />
      <TouchableOpacity
        onPress={handleSend}
        disabled={!value.trim()}
        className={`rounded-full px-4 h-[40px] justify-center ml-2 ${
          value.trim() ? 'bg-darkBlue' : 'bg-gray-300'
        }`}>
        <Text className={`font-bold ${value.trim() ? 'text-white' : 'text-gray-500'}`}>Enviar</Text>
      </TouchableOpacity>
    </View>
  )
}
