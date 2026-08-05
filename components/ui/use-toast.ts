"use client"
import { useState, useEffect, useCallback } from "react"

type ToastProps = {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

let count = 0
function genId() { return `${++count}` }

let globalListeners: Array<() => void> = []
let globalToasts: ToastProps[] = []

function emit() { globalListeners.forEach(l => l()) }

export function toast(props: Omit<ToastProps, "id">) {
  const id = genId()
  globalToasts = [...globalToasts, { id, ...props }].slice(-5)
  emit()
  setTimeout(() => {
    globalToasts = globalToasts.filter(t => t.id !== id)
    emit()
  }, 4000)
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>(globalToasts)
  
  useEffect(() => {
    const listener = () => setToasts([...globalToasts])
    globalListeners.push(listener)
    return () => { globalListeners = globalListeners.filter(l => l !== listener) }
  }, [])

  return { toasts }
}
