import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleChat } from '../store/slices/chatSlice.js'
import { socket } from '../lib/socket.js'

export function ChatPopup() {
  const dispatch = useDispatch()
  const isOpen = useSelector(s => s.chat.isOpen)
  const messages = useSelector(s => s.chat.messages)
  const { name, role } = useSelector(s => s.user)
  const [text, setText] = useState('')
  const [activeTab, setActiveTab] = useState('chat')
  const [students, setStudents] = useState({})

  useEffect(() => {
    fetch('/api/polls/students').then(r => r.json()).then(d => setStudents(d.students || {}))
    const handler = (s) => setStudents(s)
    socket.on('server:students', handler)
    return () => socket.off('server:students', handler)
  }, [])

  const send = () => {
    if (!text) return
    socket.emit('chat:message', { from: name, text })
    setText('')
  }

  const removeStudent = (socketId) => {
    socket.emit('teacher:remove_student', { socketId })
  }

  return (
    <div>
      <button className="chat-toggle" onClick={()=>dispatch(toggleChat())}>💬</button>
      {isOpen && (
        <div className="chat-panel">
          <div className="chat-tabs">
            <button className={`chat-tab ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>Chat</button>
            <button className={`chat-tab ${activeTab === 'participants' ? 'active' : ''}`} onClick={() => setActiveTab('participants')}>Participants</button>
          </div>
          
          {activeTab === 'chat' ? (
            <>
              <div className="chat-scroll">
                {messages.map(m => (
                  <div key={m.id} className="chat-item">
                    <b>{m.from}:</b> {m.text}
                  </div>
                ))}
              </div>
              <div className="chat-input">
                <input value={text} onChange={e=>setText(e.target.value)} placeholder="Type message" />
                <button className="btn" onClick={send} style={{padding:'8px 16px'}}>Send</button>
              </div>
            </>
          ) : (
            <div className="chat-scroll">
              {Object.entries(students).map(([socketId, student]) => (
                <div key={socketId} className="participant-item">
                  <span className="participant-name">{student.name}</span>
                  {role === 'teacher' && (
                    <button className="kick-btn" onClick={() => removeStudent(socketId)}>Kick out</button>
                  )}
                </div>
              ))}
              {Object.keys(students).length === 0 && (
                <div style={{color:'var(--muted)', textAlign:'center', padding:'20px'}}>No students connected</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}


