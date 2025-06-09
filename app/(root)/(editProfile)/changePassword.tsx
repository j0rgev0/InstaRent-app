import React, { useCallback, useState } from 'react'

import {
  Alert,
  Keyboard,
  Platform,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native'

import { router, useFocusEffect } from 'expo-router'

import InputTextField from '@/components/common/InputTextField'
import { authClient } from '@/lib/auth-client'

import '@/global.css'

const changePasswordPage = () => {
  const [errorMessage, setErrorMessage] = useState('')
  const [showError, setShowError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')

  const handleSave = async () => {
    try {
      setLoading(true)
      setShowError(false)
      setErrorMessage('')

      if (!currentPassword || !newPassword || !confirmNewPassword)
        throw new Error('All fields are required')

      if (newPassword !== confirmNewPassword) throw new Error('Passwords do not match')

      if (newPassword === currentPassword)
        throw new Error('The new password has to be different from the old password')

      if (newPassword === confirmNewPassword) {
        const result = await authClient.changePassword({
          newPassword: newPassword,
          currentPassword: currentPassword,
          revokeOtherSessions: true
        })

        if (result.error) throw new Error(result.error.message)

        Alert.alert('Success', 'password changed')

        router.back()
      } else throw new Error('Password not match')
    } catch (e) {
      console.log('Error saving new password: ' + e)
      Alert.alert('Error', '' + e)
      setShowError(true)
      setErrorMessage('' + e)
    } finally {
      setLoading(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'web') {
        document.title = 'Change Password'
      }
    }, [])
  )

  return (
    <TouchableWithoutFeedback
      onPress={Platform.OS !== 'web' ? Keyboard.dismiss : undefined}
      accessible={false}>
      <View className="h-full space-y-4 bg-white p-4">
        <InputTextField
          editable={!loading}
          subtitle="Current Password"
          placeholder="Enter your current password"
          iconName="lock-closed-outline"
          secureTextEntry
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />
        <InputTextField
          editable={!loading}
          subtitle="New Password"
          placeholder="Enter your new password"
          iconName="lock-closed-outline"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <InputTextField
          editable={!loading}
          subtitle="Confirm New Password"
          placeholder="Confirm your new password"
          iconName="lock-closed-outline"
          secureTextEntry
          value={confirmNewPassword}
          onChangeText={setConfirmNewPassword}
        />
        <View className="py-4">
          <TouchableOpacity
            className="rounded-2xl bg-darkBlue p-4"
            disabled={loading}
            onPress={handleSave}>
            <Text className="text-center text-lg text-white">Save</Text>
          </TouchableOpacity>
          {Platform.OS === 'web' && showError && (
            <Text className="pt-1 text-sm text-red-500">{errorMessage}</Text>
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  )
}

export default changePasswordPage
