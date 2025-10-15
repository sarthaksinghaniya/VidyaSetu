'use client'

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

interface Notification {
  type: 'application_status' | 'new_internship' | 'deadline_reminder' | 'interview_scheduled' | 'system'
  title: string
  message: string
  data?: any
  timestamp?: string
}

export const useSocket = (userId?: string, role?: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000', {
      transports: ['websocket', 'polling']
    })

    const socket = socketRef.current

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id)
      setIsConnected(true)

      // Join user room if userId is provided
      if (userId) {
        socket.emit('join_user_room', userId)
      }

      // Join role room if role is provided
      if (role) {
        socket.emit('join_role_room', role)
      }
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected')
      setIsConnected(false)
    })

    // Listen for notifications
    socket.on('notification', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev].slice(0, 50)) // Keep last 50 notifications
      
      // Show browser notification if permitted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico'
        })
      }
    })

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    return () => {
      socket.disconnect()
    }
  }, [userId, role])

  const sendNotification = (type: string, data: any) => {
    if (socketRef.current) {
      socketRef.current.emit(type, data)
    }
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  const removeNotification = (index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index))
  }

  return {
    notifications,
    isConnected,
    sendNotification,
    clearNotifications,
    removeNotification
  }
}