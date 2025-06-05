import { Alert, Platform } from 'react-native'

export class NetworkError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NetworkError'
  }
}

export const handleNetworkError = (error: any, customMessage?: string) => {
  console.error('Network error:', error)

  let errorMessage = customMessage || 'An error occurred while connecting to the server'

  if (error instanceof NetworkError) {
    errorMessage = error.message
  } else if (error instanceof TypeError && error.message.includes('fetch')) {
    errorMessage = 'Unable to connect to the server. Please check your internet connection.'
  } else if (error.response) {
    // Error de respuesta del servidor
    errorMessage = error.response.data?.error || error.response.data?.message || 'Server error'
  }

  if (Platform.OS === 'web') {
    // En web, podríamos mostrar un toast o notificación
    console.error(errorMessage)
  } else {
    Alert.alert('Error', errorMessage)
  }

  return errorMessage
}

export const fetchWithErrorHandling = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  try {
    const response = await fetch(url, options)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new NetworkError(errorData.error || `HTTP error! status: ${response.status}`)
    }

    return response
  } catch (error) {
    if (error instanceof NetworkError) {
      throw error
    }
    throw new NetworkError('Network request failed')
  }
}
