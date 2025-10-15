'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bell, X, Clock, CheckCircle, AlertCircle, Briefcase, Calendar } from 'lucide-react'
import { useSocket } from '@/hooks/use-socket'

interface NotificationBellProps {
  userId?: string
  role?: string
}

export function NotificationBell({ userId, role }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { notifications, isConnected, clearNotifications, removeNotification } = useSocket(userId, role)

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'application_status':
        return <CheckCircle className="w-4 h-4 text-blue-600" />
      case 'new_internship':
        return <Briefcase className="w-4 h-4 text-green-600" />
      case 'deadline_reminder':
        return <Clock className="w-4 h-4 text-orange-600" />
      case 'interview_scheduled':
        return <Calendar className="w-4 h-4 text-purple-600" />
      default:
        return <Bell className="w-4 h-4 text-gray-600" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'application_status':
        return 'border-blue-200 bg-blue-50'
      case 'new_internship':
        return 'border-green-200 bg-green-50'
      case 'deadline_reminder':
        return 'border-orange-200 bg-orange-50'
      case 'interview_scheduled':
        return 'border-purple-200 bg-purple-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {notifications.length > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center p-0 text-xs"
          >
            {notifications.length > 99 ? '99+' : notifications.length}
          </Badge>
        )}
        {!isConnected && (
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-12 w-80 z-50 shadow-lg border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Notifications</CardTitle>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearNotifications}
                    className="text-xs"
                  >
                    Clear all
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <CardDescription className="text-xs">
              {isConnected ? 'Connected' : 'Connecting...'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                <div className="space-y-2 p-2">
                  {notifications.map((notification, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${getNotificationColor(notification.type)} relative group`}
                    >
                      <button
                        onClick={() => removeNotification(index)}
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="flex gap-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          {notification.timestamp && (
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(notification.timestamp).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}