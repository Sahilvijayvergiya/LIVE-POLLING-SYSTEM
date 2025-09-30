import { io } from 'socket.io-client'

function resolveBackendUrl() {
  const envUrl = import.meta.env.VITE_BACKEND_URL
  if (envUrl) return envUrl
  const { protocol, hostname } = window.location
  // In dev, always target backend on 4003 regardless of Vite port
  if (import.meta.env.DEV) {
    return `${protocol}//${hostname}:4003`
  }
  // In production, same-origin by default
  return `${protocol}//${hostname}`
}

export const socket = io("https://live-polling-system-89i7.onrender.com", {
  autoConnect: true,
  withCredentials: true,
  // Allow both websocket and polling to maximize compatibility
  transports: ['websocket', 'polling'],
})


