"use client"
import { useToast } from "@/components/ui/use-toast"

export function Toaster() {
  const { toasts } = useToast()
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-lg shadow-lg text-sm ${
            t.variant === "destructive" ? "bg-red-600 text-white" : "bg-[#6366F1] text-white"
          }`}
        >
          {t.title && <p className="font-semibold">{t.title}</p>}
          {t.description && <p className="text-xs opacity-90">{t.description}</p>}
        </div>
      ))}
    </div>
  )
}
