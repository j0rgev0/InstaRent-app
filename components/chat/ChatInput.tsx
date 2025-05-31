import { Text, TextInput, TouchableOpacity, View } from 'react-native'

type ChatInputProps = {
  value: string
  onChangeText: (text: string) => void
  onSend: () => void
}

export function ChatInput({ value, onChangeText, onSend }: ChatInputProps) {
  return (
    <View className="flex-row px-2.5 pb-10 py-2 border-t border-gray-300 bg-white">
      <TextInput
        className="flex-1 bg-gray-200 rounded-full px-4 text-base h-10"
        placeholder="Escribe un mensaje..."
        placeholderTextColor="#999"
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSend}
        returnKeyType="send"
      />
      <TouchableOpacity
        onPress={onSend}
        className="bg-darkBlue rounded-full px-4 justify-center ml-2">
        <Text className="text-white font-bold">Enviar</Text>
      </TouchableOpacity>
    </View>
  )
}
