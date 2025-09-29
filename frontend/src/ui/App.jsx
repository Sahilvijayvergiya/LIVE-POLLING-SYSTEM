import React, { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setSocketId } from '../store/slices/userSlice.js'
import { setActivePoll, updateResults, closePoll } from '../store/slices/pollSlice.js'
import { addMessage } from '../store/slices/chatSlice.js'
import { socket } from '../lib/socket.js'
import { Teacher } from './Teacher.jsx'
import { Student } from './Student.jsx'
import { ChatPopup } from './ChatPopup.jsx'
import { RoleGate } from './RoleGate.jsx'

export function App() {
  const dispatch = useDispatch()
  const role = useSelector(s => s.user.role)
  const name = useSelector(s => s.user.name)

  useEffect(() => {
    socket.on('connect', () => {
      dispatch(setSocketId(socket.id))
    })
    socket.on('client:ack', (p) => dispatch(setSocketId(p.socketId)))
    socket.on('server:new_poll', (poll) => dispatch(setActivePoll(poll)))
    socket.on('server:state', ({ activePoll }) => dispatch(setActivePoll(activePoll)))
    socket.on('server:results_update', (r) => dispatch(updateResults(r)))
    socket.on('server:poll_closed', () => dispatch(closePoll()))
    socket.on('chat:new_message', (m) => dispatch(addMessage(m)))

    return () => {
      socket.off()
    }
  }, [dispatch])

  useEffect(() => {
    if (name) {
      socket.emit('client:hello', { name, role })
    }
  }, [name, role])

  const view = useMemo(() => !name ? <RoleGate /> : (role === 'teacher' ? <Teacher /> : <Student />), [role, name])

  return (
    <div style={{fontFamily:'Inter, system-ui', minHeight:'100vh'}}>
      {view}
      <ChatPopup />
    </div>
  )
}


