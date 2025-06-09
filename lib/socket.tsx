import { CHAT_API_URL, INSTARENT_API_KEY, INSTARENT_API_URL } from '@/utils/constants'
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import { io, Socket } from 'socket.io-client'
import { showMessageToast } from '../utils/toast'
import { authClient } from './auth-client'

class SocketService {
  private socket: Socket | null = null
  private static instance: SocketService
  private messageHandlers: Map<string, ((data: any) => void)[]> = new Map()
  private isConnected: boolean = false
  private unreadCount: number = 0
  private unreadCountListeners: ((count: number) => void)[] = []
  private joinedRooms: Set<string> = new Set()
  private isInChatScreen: boolean = false

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService()
    }
    return SocketService.instance
  }

  public setInChatScreen(value: boolean) {
    this.isInChatScreen = value
  }

  private async fetchUserData(userId: string) {
    try {
      const response = await fetch(`${INSTARENT_API_URL}/users/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${INSTARENT_API_KEY}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch user data')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching user data:', error)
      return null
    }
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

        this.joinedRooms.forEach((roomId) => this.joinRoom(roomId))
      })

      this.socket.on('disconnect', () => {
        this.isConnected = false
        console.log('Socket disconnected')
      })

      this.socket.on('error', (error) => {
        console.error('Socket error:', error)
      })

      this.socket.on('receive_message', async (data) => {
        this.notifyHandlers('receive_message', data)
        if (data.receiverId === userId) {
          this.incrementUnreadCount()
          this.fetchUnreadCount(userId)

          if (!this.isInChatScreen) {
            const userData = await this.fetchUserData(data.senderId)
            const senderName = userData?.name
            showMessageToast(senderName, data.message)
          }
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
    if (this.socket && !this.joinedRooms.has(roomId)) {
      this.socket.emit('join_room', roomId)
      this.joinedRooms.add(roomId)
    }
  }

  public leaveRoom(roomId: string) {
    if (this.socket && this.joinedRooms.has(roomId)) {
      this.socket.emit('leave_room', roomId)
      this.joinedRooms.delete(roomId)
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

      if (!response.ok) {
        throw new Error('Failed to fetch unread count')
      }

      const data = await response.json()
      const count = Array.isArray(data) ? data.length : data.count || 0
      this.setUnreadCount(count)
      return count
    } catch (error) {
      console.error('Error fetching unread count:', error)
      return 0
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
    if (this.unreadCount !== count) {
      this.unreadCount = count
      this.unreadCountListeners.forEach((listener) => listener(count))
    }
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

export const socketService = SocketService.getInstance()

const SocketContext = createContext<SocketService | null>(null)

const UnreadCountContext = createContext<number>(0)

export function SocketProvider({ children }: { children: ReactNode }) {
  const { data: session } = authClient.useSession()
  const userId = session?.user?.id
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!userId) return

    socketService.connect(userId)

    const unsubscribe = socketService.onUnreadCountChange(setUnreadCount)

    const intervalId = setInterval(() => {
      if (userId) {
        socketService.fetchUnreadCount(userId)
      }
    }, 30000)

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && userId) {
        socketService.fetchUnreadCount(userId)
      }
    })

    return () => {
      unsubscribe()
      socketService.disconnect()
      clearInterval(intervalId)
      subscription.remove()
    }
  }, [userId])

  return (
    <SocketContext.Provider value={socketService}>
      <UnreadCountContext.Provider value={unreadCount}>{children}</UnreadCountContext.Provider>
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const socket = useContext(SocketContext)
  if (!socket) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return socket
}

export function useUnreadCount() {
  return useContext(UnreadCountContext)
}
