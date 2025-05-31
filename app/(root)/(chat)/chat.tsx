import React, { useState } from 'react'
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  ListRenderItemInfo,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native'

type Message = {
  id: string
  text: string
  sender: 'user' | 'bot'
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hola, ¿en qué puedo ayudarte?', sender: 'bot' },
    { id: '2', text: '¡Hola! Quiero saber más sobre su propiedad.', sender: 'user' }
  ])

  const [input, setInput] = useState('')

  const sendMessage = () => {
    if (input.trim() === '') return
    const newMessage: Message = {
      id: (messages.length + 1).toString(),
      text: input,
      sender: 'user'
    }
    setMessages([...messages, newMessage])
    setInput('')
  }

  const renderItem = ({ item }: ListRenderItemInfo<Message>) => {
    const isUser = item.sender === 'user'

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
        <Text className={`text-base ${isUser ? 'text-white' : 'text-darkBlue'}`}>{item.text}</Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-end">
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 10, paddingBottom: 10 }}
            keyboardShouldPersistTaps="handled"
          />

          <View className="flex-row px-2.5 pb-10 py-2 border-t border-gray-300 bg-white">
            <TextInput
              className="flex-1 bg-gray-200 rounded-full px-4 text-base h-10"
              placeholder="Escribe un mensaje..."
              placeholderTextColor="#999"
              value={input}
              onChangeText={setInput}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
            />
            <TouchableOpacity
              onPress={sendMessage}
              className="bg-darkBlue rounded-full px-4 justify-center ml-2">
              <Text className="text-white font-bold">Enviar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}
