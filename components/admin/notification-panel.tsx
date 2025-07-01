"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, AlertTriangle, AlertCircle, Info, CheckCircle, X } from "lucide-react"

interface Notification {
  id: string
  type: "error" | "warning" | "info" | "success"
  title: string
  message: string
  count: number
  priority: "high" | "medium" | "low"
}

export function NotificationPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState<string[]>([])

  useEffect(() => {
    fetchNotifications()
    // Refresh notifications every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/admin/notifications")
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "error":
        return <AlertTriangle className="h-4 w-4" />
      case "warning":
        return <AlertCircle className="h-4 w-4" />
      case "info":
        return <Info className="h-4 w-4" />
      case "success":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getVariant = (type: string) => {
    switch (type) {
      case "error":
        return "destructive"
      case "warning":
        return "secondary"
      case "info":
        return "outline"
      case "success":
        return "default"
      default:
        return "outline"
    }
  }

  const getColorClasses = (type: string) => {
    switch (type) {
      case "error":
        return "border-red-200 bg-red-50 text-red-800"
      case "warning":
        return "border-orange-200 bg-orange-50 text-orange-800"
      case "info":
        return "border-blue-200 bg-blue-50 text-blue-800"
      case "success":
        return "border-green-200 bg-green-50 text-green-800"
      default:
        return "border-gray-200 bg-gray-50 text-gray-800"
    }
  }

  const dismissNotification = (id: string) => {
    setDismissed([...dismissed, id])
  }

  const activeNotifications = notifications.filter((n) => !dismissed.includes(n.id))
  const highPriorityCount = activeNotifications.filter((n) => n.priority === "high").length

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {highPriorityCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {highPriorityCount}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={fetchNotifications}>
            Refresh
          </Button>
        </CardTitle>
        <CardDescription>System alerts and important updates</CardDescription>
      </CardHeader>
      <CardContent>
        {activeNotifications.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-2" />
            <p className="text-muted-foreground">All caught up! No new notifications.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeNotifications
              .sort((a, b) => {
                const priorityOrder = { high: 3, medium: 2, low: 1 }
                return priorityOrder[b.priority] - priorityOrder[a.priority]
              })
              .map((notification) => (
                <div key={notification.id} className={`p-3 rounded-lg border ${getColorClasses(notification.type)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2 flex-1">
                      {getIcon(notification.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          <Badge variant={getVariant(notification.type)} className="text-xs">
                            {notification.count}
                          </Badge>
                        </div>
                        <p className="text-sm opacity-90">{notification.message}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissNotification(notification.id)}
                      className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
