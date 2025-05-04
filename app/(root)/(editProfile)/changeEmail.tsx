import React, { useState } from 'react'

import {
  Alert,
  Keyboard,
  Platform,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native'

import { authClient } from '@/lib/auth-client'
import InputTextField from '@/components/personals/InputTextField'
import '@/global.css'

const changeEmailPage = () => {
  const [errorMessage, setErrorMessage] = useState('')
  const [showError, setShowError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newEmail, setNewEmail] = useState('')

  const handleSave = async () => {
    try {
      setLoading(true)
      setShowError(false)
      setErrorMessage('')

      if (!newEmail) {
        throw new Error('Email is required')
      }

      const result = await authClient.changeEmail({
        newEmail: newEmail,
        callbackURL: '/'
      })
      if (result.error) throw new Error(result.error.message)

      Alert.alert('Alert', 'Comfirm the email change in your old email inbox')
    } catch (e) {
      console.log('Error updating email: ' + e)
      Alert.alert('Error', '' + e)
      setShowError(true)
      setErrorMessage('' + e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <TouchableWithoutFeedback
      onPress={Platform.OS !== 'web' ? Keyboard.dismiss : undefined}
      accessible={false}>
      <View className="h-full space-y-4 bg-white p-4">
        <InputTextField
          editable={!loading}
          subtitle="New Email"
          placeholder="Enter your new Email"
          iconName="mail-outline"
          value={newEmail}
          onChangeText={setNewEmail}
        />
        <View className="py-4">
          <TouchableOpacity
            className="rounded-md bg-darkBlue p-4"
            disabled={loading}
            onPress={handleSave}>
            <Text className="text-center text-lg text-white">Save</Text>
          </TouchableOpacity>
          {Platform.OS === 'web' && showError ? (
            <Text className="pt-1 text-sm text-red-500">{errorMessage}</Text>
          ) : (
            ''
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  )
}

export default changeEmailPage
