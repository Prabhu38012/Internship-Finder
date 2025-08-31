import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import socketService from '../services/socketService'

export const useSocket = () => {
  const { token, user } = useSelector((state) => state.auth)
  const isConnectedRef = useRef(false)

  useEffect(() => {
    if (token && user && !isConnectedRef.current) {
      socketService.connect(token)
      isConnectedRef.current = true

      // Join user-specific room for notifications
      if (user._id) {
        socketService.joinRoom(`user:${user._id}`)
      }

      // Join role-specific rooms
      if (user.role) {
        socketService.joinRoom(`role:${user.role}`)
      }
    }

    return () => {
      if (isConnectedRef.current) {
        socketService.disconnect()
        isConnectedRef.current = false
      }
    }
  }, [token, user])

  return {
    socket: socketService.socket,
    isConnected: socketService.getConnectionStatus(),
    emit: socketService.emit.bind(socketService),
    on: socketService.on.bind(socketService),
    off: socketService.off.bind(socketService),
    joinRoom: socketService.joinRoom.bind(socketService),
    leaveRoom: socketService.leaveRoom.bind(socketService)
  }
}

export default useSocket
