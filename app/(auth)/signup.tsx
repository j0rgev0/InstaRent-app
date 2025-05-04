import { useState } from 'react'

import { Link, useRouter } from 'expo-router'
import { Alert, Keyboard, Platform, Text, TouchableWithoutFeedback, View } from 'react-native'

import Button from '@/components/common/Button'
import InputTextField from '@/components/common/InputTextField'
import { authClient } from '@/lib/auth-client'

import '@/global.css'

export default function SignUpPage() {
  const router = useRouter()

  const [errorMessage, setErrorMessage] = useState('')
  const [showError, setShowError] = useState(false)
  const [email, setEmail] = useState<string>('')
  const [username, setUsername] = useState<string>('')
  const [name, setName] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  const handleSignUp = async () => {
    setLoading(true)
    const res = await authClient.signUp.email(
      {
        email,
        password,
        name,
        // @ts-ignore
        username
      },
      {
        onError: (ctx) => {
          setShowError(true)
          setErrorMessage('Error: ' + ctx.error.message)
          Alert.alert('Error', ctx.error.message)
          console.log(ctx)
        },
        onSuccess: () => {
          Alert.alert('Account created', 'Successfully created an account', [
            {
              text: 'Continue',
              onPress: () => router.replace('/(root)/(tabs)/profile')
            }
          ])
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
            <Text className="mb-2 text-2xl font-bold text-gray-800">Create Account</Text>
            <Text className="text-center text-gray-500">
              Sign up to get started with your account
            </Text>
          </View>

          <View className="space-y-4">
            <InputTextField
              editable={!loading}
              subtitle="Username"
              placeholder="Create a username"
              iconName="person-circle-outline"
              value={username}
              onChangeText={setUsername}
            />
            <InputTextField
              editable={!loading}
              subtitle="Name"
              placeholder="Enter your name"
              iconName="person-outline"
              value={name}
              onChangeText={setName}
            />
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
              placeholder="Create a password"
              iconName="lock-closed-outline"
              value={password}
              keyboardType="default"
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View className="mt-6">
            <Button
              title="Sign Up"
              loadingTitle="Signing Up..."
              loading={loading}
              onPress={handleSignUp}
            />
          </View>

          {Platform.OS === 'web' && showError && (
            <Text className="pt-1 text-sm text-red-500">{errorMessage}</Text>
          )}

          <View className="mt-6 flex-row justify-center">
            <Text className="text-gray-500">
              Already have an account?{' '}
              <Link href={'/(auth)/signin'} replace>
                <Text className="font-semibold text-blue-500">Sign In</Text>
              </Link>
            </Text>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  )
}
