"use client"
import { useToast } from "@/components/ui/use-toast"
import { X } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()
  
  if (toasts.length === 0) return null
  
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`px-5 py-3 rounded-xl shadow-2xl text-sm font-medium animate-in slide-in-from-right ${
            t.variant === "destructive" 
              ? "bg-red-600 text-white" 
              : "bg-[#6366F1] text-white"
          }`}
        >
          {t.title && <p className="font-semibold text-base">{t.title}</p>}
          {t.description && <p className="text-xs opacity-90 mt-1">{t.description}</p>}
        </div>
      ))}
    </div>
  )
}
