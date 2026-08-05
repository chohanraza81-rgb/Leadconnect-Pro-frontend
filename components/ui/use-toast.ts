"use client"
import { useState, useEffect } from "react"

type ToastProps = {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

let count = 0
function genId() { return `${++count}` }

let listeners: Array<() => void> = []
let toasts: ToastProps[] = []

function emit() { listeners.forEach(l => l()) }

export function toast(props: Omit<ToastProps, "id">) {
  const id = genId()
  toasts = [...toasts, { id, ...props }].slice(-5)
  emit()
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id)
    emit()
  }, 4000)
}

export function useToast() {
  const [state, setState] = useState<ToastProps[]>(toasts)
  
  useEffect(() => {
    const listener = () => setState([...toasts])
    listeners.push(listener)
    return () => { listeners = listeners.filter(l => l !== listener) }
  }, [])

  return { toasts: state, toast }
}
