"use client"

import { useEffect } from "react"

export function AutoInitializer() {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await fetch("/api/init")
      } catch (error) {
        console.error("Failed to initialize app:", error)
      }
    }

    initializeApp()
  }, [])

  return null
}
