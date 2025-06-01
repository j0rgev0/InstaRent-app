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
      this.socket = io('http://localhost:3000', {
        query: { userId },
        transports: ['websocket']
      })

      this.socket.on('connect', () => {
        console.log('Connected to socket server')
      })

      this.socket.on('disconnect', () => {
        console.log('Disconnected from socket server')
      })

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

  public sendMessage(message: { text: string; sender: string; receiver: string }) {
    if (this.socket) {
      this.socket.emit('message', message)
    }
  }

  public onMessage(callback: (message: any) => void) {
    if (this.socket) {
      this.socket.on('message', callback)
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
