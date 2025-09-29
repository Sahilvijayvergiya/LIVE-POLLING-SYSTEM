import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { setUser } from '../store/slices/userSlice.js'

export function RoleGate() {
  const dispatch = useDispatch()
  const [role, setRole] = useState('student')
  const [name, setName] = useState('')

  useEffect(() => {
    const saved = sessionStorage.getItem('studentName')
    if (saved) setName(saved)
  }, [])

  const enter = () => {
    if (!name) return
    if (role === 'student') sessionStorage.setItem('studentName', name)
    dispatch(setUser({ name, role }))
  }

  return (
    <div className="container" style={{maxWidth:800, margin:'10vh auto', textAlign:'center'}}>
      <div style={{marginBottom:'40px'}}>
        <div className="pill" style={{display:'inline-block', marginBottom:'16px'}}>Intervue Poll</div>
        <h1 style={{fontSize:'32px', fontWeight:'700', color:'var(--text)', margin:'0 0 16px 0'}}>Welcome to the Live Polling System</h1>
        <p style={{color:'var(--muted)', fontSize:'16px', margin:'0'}}>Please select the role that best describes you to begin using the live polling system</p>
      </div>
      
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px', marginBottom:'32px'}}>
        <div className={`role-card ${role === 'student' ? 'selected' : ''}`} onClick={() => setRole('student')}>
          <h3 className="role-title">I'm a Student</h3>
          <p className="role-desc">Submit answers and view live poll results in real-time</p>
        </div>
        <div className={`role-card ${role === 'teacher' ? 'selected' : ''}`} onClick={() => setRole('teacher')}>
          <h3 className="role-title">I'm a Teacher</h3>
          <p className="role-desc">Create polls, ask questions, and monitor student responses in real-time</p>
        </div>
      </div>
      
      <div style={{maxWidth:'400px', margin:'0 auto'}}>
        <label className="label">Your name</label>
        <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="Enter your name" />
        <button className="btn" onClick={enter} style={{width:'100%', marginTop:'16px'}}>Continue</button>
      </div>
    </div>
  )
}


