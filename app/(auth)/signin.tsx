import { useState } from 'react'

import { View, Text, TouchableWithoutFeedback, Keyboard, Alert, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { Link } from 'expo-router'

import InputTextField from '@/components/personals/InputTextField'
import { authClient } from '@/lib/auth-client'
import Button from '@/components/personals/Button'

import '@/global.css'

export default function SignInPage() {
  const router = useRouter()

  const [errorMessage, setErrorMessage] = useState('')
  const [showError, setShowError] = useState(false)
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  const handleSignIn = async () => {
    setLoading(true)
    const res = await authClient.signIn.email(
      {
        email,
        password
      },
      {
        onError: (ctx) => {
          setShowError(true)
          setErrorMessage('Error: ' + ctx.error.message)
          Alert.alert('Error', ctx.error.message)
          console.log(ctx)
        },
        onSuccess: () => {
          router.replace('/(root)/(tabs)/profile')
        }
      }
    )
    console.log(res)
    setLoading(false)
  }

  return (
    <TouchableWithoutFeedback
      onPress={Platform.OS !== 'web' ? Keyboard.dismiss : undefined}
      accessible={false}>
      <View className="flex-1 justify-center bg-white">
        <View className="px-6 py-8">
          <View className="mb-5 items-center">
            <Text className="mb-2 text-2xl font-bold text-gray-800">Welcome Back</Text>
            <Text className="text-center text-gray-500">Sign in to continue to your account</Text>
          </View>

          <View className="space-y-4">
            <InputTextField
              editable={!loading}
              subtitle="Email"
              placeholder="Enter your email"
              iconName="mail-outline"
              value={email}
              keyboardType="email-address"
              onChangeText={setEmail}
            />
            <InputTextField
              editable={!loading}
              subtitle="Password"
              placeholder="Enter your password"
              iconName="lock-closed-outline"
              value={password}
              keyboardType="default"
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View className="mt-6">
            <Button
              title="Sign In"
              loadingTitle="Signing In..."
              loading={loading}
              onPress={handleSignIn}
            />
          </View>

          {Platform.OS === 'web' && showError && (
            <Text className="pt-1 text-sm text-red-500">{errorMessage}</Text>
          )}
          <View className="mt-6 flex-row justify-center">
            <Text className="text-gray-500">
              Don't have an account?{' '}
              <Link href={'/(auth)/signup'} replace>
                <Text className="font-semibold text-blue-500">Sign Up</Text>
              </Link>
            </Text>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  )
}
