import { CHAT_API_URL, INSTARENT_API_KEY, INSTARENT_API_URL } from '@/utils/constants'
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { authClient } from './auth-client'

class SocketService {
  private socket: Socket | null = null
  private static instance: SocketService
  private messageHandlers: Map<string, ((data: any) => void)[]> = new Map()
  private isConnected: boolean = false
  private unreadCount: number = 0
  private unreadCountListeners: ((count: number) => void)[] = []

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService()
    }
    return SocketService.instance
  }

  public connect(userId: string) {
    if (!this.socket) {
      this.socket = io(CHAT_API_URL, {
        query: { userId },
        transports: ['websocket']
      })

      this.socket.on('connect', () => {
        this.isConnected = true
        console.log('Socket connected')
        this.fetchUnreadCount(userId)
      })

      this.socket.on('disconnect', () => {
        this.isConnected = false
        console.log('Socket disconnected')
      })

      this.socket.on('error', (error) => {
        console.error('Socket error:', error)
      })

      // Add global message handler
      this.socket.on('receive_message', (data) => {
        this.notifyHandlers('receive_message', data)
        if (data.receiverId === userId) {
          this.incrementUnreadCount()
        }
      })
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  public joinRoom(roomId: string) {
    if (this.socket) {
      this.socket.emit('join_room', roomId)
    }
  }

  public sendMessage(message: {
    roomId: string
    senderId: string
    receiverId: string
    message: string
    tempId?: string
  }) {
    if (this.socket) {
      this.socket.emit('send_message', message)
    }
  }

  public onMessage(callback: (message: any) => void) {
    this.addHandler('receive_message', callback)
  }

  public onTyping(callback: (data: { userId: string; isTyping: boolean }) => void) {
    this.addHandler('typing', callback)
    if (this.socket) {
      this.socket.on('typing', callback)
    }
  }

  public emitTyping(isTyping: boolean) {
    if (this.socket) {
      this.socket.emit('typing', { isTyping })
    }
  }

  public addHandler(event: string, callback: (data: any) => void) {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, [])
    }
    this.messageHandlers.get(event)?.push(callback)
  }

  public removeHandler(event: string, callback: (data: any) => void) {
    const handlers = this.messageHandlers.get(event)
    if (handlers) {
      const index = handlers.indexOf(callback)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  private notifyHandlers(event: string, data: any) {
    const handlers = this.messageHandlers.get(event)
    if (handlers) {
      handlers.forEach((handler) => handler(data))
    }
  }

  public isSocketConnected(): boolean {
    return this.isConnected
  }

  public async fetchUnreadCount(userId: string) {
    try {
      const response = await fetch(`${INSTARENT_API_URL}/chat/unread/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${INSTARENT_API_KEY}`
        }
      })
      const data = await response.json()
      const count = Array.isArray(data) ? data.length : data.count || 0
      this.setUnreadCount(count)
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  public incrementUnreadCount() {
    this.setUnreadCount(this.unreadCount + 1)
  }

  public decrementUnreadCount() {
    this.setUnreadCount(Math.max(0, this.unreadCount - 1))
  }

  public resetUnreadCount() {
    this.setUnreadCount(0)
  }

  private setUnreadCount(count: number) {
    this.unreadCount = count
    this.unreadCountListeners.forEach((listener) => listener(count))
  }

  public getUnreadCount(): number {
    return this.unreadCount
  }

  public onUnreadCountChange(callback: (count: number) => void) {
    this.unreadCountListeners.push(callback)
    return () => {
      const index = this.unreadCountListeners.indexOf(callback)
      if (index > -1) {
        this.unreadCountListeners.splice(index, 1)
      }
    }
  }
}

// Export a singleton instance
export const socketService = SocketService.getInstance()

// Create a context for the socket service
const SocketContext = createContext<SocketService | null>(null)

// Create a context for unread count
const UnreadCountContext = createContext<number>(0)

// Create a provider component
export function SocketProvider({ children }: { children: ReactNode }) {
  const { data: session } = authClient.useSession()
  const userId = session?.user?.id
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!userId) return

    // Connect to socket when user is authenticated
    socketService.connect(userId)

    // Subscribe to unread count changes
    const unsubscribe = socketService.onUnreadCountChange(setUnreadCount)

    // Cleanup on unmount
    return () => {
      unsubscribe()
      socketService.disconnect()
    }
  }, [userId])

  return (
    <SocketContext.Provider value={socketService}>
      <UnreadCountContext.Provider value={unreadCount}>{children}</UnreadCountContext.Provider>
    </SocketContext.Provider>
  )
}

// Create a hook to use the socket service
export function useSocket() {
  const socket = useContext(SocketContext)
  if (!socket) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return socket
}

// Create a hook to use the unread count
export function useUnreadCount() {
  return useContext(UnreadCountContext)
}
