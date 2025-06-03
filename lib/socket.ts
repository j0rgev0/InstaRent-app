import { CHAT_API_URL } from '@/utils/constants'
import { io, Socket } from 'socket.io-client'

class SocketService {
  private socket: Socket | null = null
  private static instance: SocketService

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

      this.socket.on('connect', () => {})

      this.socket.on('disconnect', () => {})

      this.socket.on('error', (error) => {
        console.error('Socket error:', error)
      })
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
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
    if (this.socket) {
      this.socket.on('receive_message', callback)
    }
  }

  public onTyping(callback: (data: { userId: string; isTyping: boolean }) => void) {
    if (this.socket) {
      this.socket.on('typing', callback)
    }
  }

  public emitTyping(isTyping: boolean) {
    if (this.socket) {
      this.socket.emit('typing', { isTyping })
    }
  }
}

export const socketService = SocketService.getInstance()
