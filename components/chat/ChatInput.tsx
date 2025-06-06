import { useSocket } from '@/lib/socket'
import { Ionicons } from '@expo/vector-icons'
import React, { useEffect, useRef, useState } from 'react'
import { Keyboard, KeyboardEvent, Platform, TextInput, TouchableOpacity, View } from 'react-native'

type ChatInputProps = {
  value: string
  onChangeText: (text: string) => void
  onSend: () => void
  currentUserId: string | undefined
  receiverId: string | undefined
}

export function ChatInput({
  value,
  onChangeText,
  onSend,
  currentUserId,
  receiverId
}: ChatInputProps) {
  const [isTyping, setIsTyping] = useState(false)
  const socket = useSocket()

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

  const handleTyping = (text: string) => {
    onChangeText(text)
    if (!isTyping) {
      setIsTyping(true)
      socket.emitTyping(true)
    }
  }

  const handleSend = () => {
    if (value.trim()) {
      onSend()
      setIsTyping(false)
      socket.emitTyping(false)
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
              : 25
            : !isKeyboardVisible
              ? 30
              : 10
      }}>
      <TextInput
        className="flex-1 bg-gray-100 rounded-full px-4 py-2 mr-2"
        placeholder="Type a message..."
        value={value}
        onChangeText={handleTyping}
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
        <Ionicons name={Platform.OS === 'ios' ? 'arrow-up' : 'send'} size={20} color="white" />
      </TouchableOpacity>
    </View>
  )
}
