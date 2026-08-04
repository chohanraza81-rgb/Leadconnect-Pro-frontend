"use client"
import * as React from "react"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 5000

type ToastProps = {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

const toastState: { toasts: ToastProps[] } = { toasts: [] }
const listeners: Array<(state: typeof toastState) => void> = []

function dispatch(action: any) {
  switch (action.type) {
    case "ADD_TOAST":
      toastState.toasts = [...toastState.toasts, action.toast].slice(0, TOAST_LIMIT)
      break
    case "REMOVE_TOAST":
      toastState.toasts = toastState.toasts.filter(t => t.id !== action.toastId)
      break
  }
  listeners.forEach(l => l(toastState))
}

export function toast({ title, description, variant = "default" }: Omit<ToastProps, "id">) {
  const id = genId()
  dispatch({ type: "ADD_TOAST", toast: { id, title, description, variant } })
  setTimeout(() => dispatch({ type: "REMOVE_TOAST", toastId: id }), TOAST_REMOVE_DELAY)
}

export function useToast() {
  const [state, setState] = React.useState(toastState)
  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) listeners.splice(index, 1)
    }
  }, [])
  return { ...state, toast }
}
