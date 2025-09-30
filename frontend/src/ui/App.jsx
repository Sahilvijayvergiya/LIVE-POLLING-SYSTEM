import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setSocketId } from '../store/slices/userSlice.js'
import { setActivePoll, updateResults, closePoll } from '../store/slices/pollSlice.js'
import { addMessage } from '../store/slices/chatSlice.js'
import { socket } from '../lib/socket.js'
import { Teacher } from './Teacher.jsx'
import { Student } from './Student.jsx'
import { ChatPopup } from './ChatPopup.jsx'
import { RoleGate } from './RoleGate.jsx'
import { ResultsPage } from './ResultsPage.jsx'

function Toasts({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.level}`}>{t.text}</div>
      ))}
    </div>
  )
}

export function App() {
  const dispatch = useDispatch()
  const role = useSelector(s => s.user.role)
  const name = useSelector(s => s.user.name)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')
  const [route, setRoute] = useState('main') // 'main' | 'results'
  const [toasts, setToasts] = useState([])

  const pushToast = useCallback((text, level='info') => {
    const id = Date.now() + Math.random()
    setToasts(ts => [...ts, { id, text, level }])
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 5000)
  }, [])

  useEffect(() => {
    socket.on('connect', () => {
      dispatch(setSocketId(socket.id))
    })
    socket.on('connect_error', (e) => pushToast(`Socket connect error: ${e?.message || e}`, 'error'))
    socket.on('error', (e) => pushToast(`Socket error: ${e?.message || e}`, 'error'))
    socket.on('reconnect_attempt', () => pushToast('Reconnecting...', 'warn'))
    socket.on('reconnect', () => pushToast('Reconnected', 'info'))
    socket.on('client:ack', (p) => dispatch(setSocketId(p.socketId)))
    socket.on('server:new_poll', (poll) => dispatch(setActivePoll(poll)))
    socket.on('server:state', ({ activePoll }) => dispatch(setActivePoll(activePoll)))
    socket.on('server:results_update', (r) => dispatch(updateResults(r)))
    socket.on('server:poll_closed', () => dispatch(closePoll()))
    socket.on('server:error', (p) => pushToast(p?.error || 'Server error', 'error'))
    socket.on('chat:new_message', (m) => dispatch(addMessage(m)))

    return () => {
      socket.off()
    }
  }, [dispatch])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    if (name) {
      socket.emit('client:hello', { name, role })
    }
  }, [name, role])

  const view = useMemo(() => {
    if (!name) return <RoleGate />
    if (route === 'results' && role === 'teacher') return <ResultsPage onBack={() => setRoute('main')} />
    return role === 'teacher' ? <Teacher onViewResults={() => setRoute('results')} /> : <Student />
  }, [role, name, route])

  return (
    <div style={{fontFamily:'Inter, system-ui', minHeight:'100vh'}}>
      <nav className="topbar">
        <div className="topbar-spacer" />
        <div className="topbar-actions">
          {role === 'teacher' && (
            route === 'results' ? (
              <button className="btn btn-ghost" onClick={()=>setRoute('main')}>Back</button>
            ) : (
              <button className="btn btn-ghost" onClick={()=>setRoute('results')}>Past Results</button>
            )
          )}
          <button className="btn btn-ghost" onClick={()=>setTheme(t=> t==='light'?'dark':'light')}>
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
        </div>
      </nav>
      <Toasts toasts={toasts} />
      {view}
      <ChatPopup />
    </div>
  )
}


