import { create } from 'zustand'
import type { ToastData, ToastVariant } from '@/shared/components/ui/toast'

let toastCounter = 0

interface ToastState {
  toasts: ToastData[];
  toast: (message: string, variant?: ToastVariant, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],

  toast: (message: string, variant: ToastVariant = 'info', duration: number = 4000) => {
    const id = `toast-${++toastCounter}`
    const toast: ToastData = { id, message, variant, duration }
    set((state) => ({ toasts: [...state.toasts, toast] }))
  },

  success: (message: string) => {
    get().toast(message, 'success')
  },

  error: (message: string) => {
    get().toast(message, 'error', 6000)
  },

  warning: (message: string) => {
    get().toast(message, 'warning', 5000)
  },

  info: (message: string) => {
    get().toast(message, 'info')
  },

  dismiss: (id: string) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
  },
}))
