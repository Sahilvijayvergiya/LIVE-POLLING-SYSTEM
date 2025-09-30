import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setActivePoll } from '../store/slices/pollSlice.js'
import { socket } from '../lib/socket.js'
import { PastPolls } from './PastPolls.jsx'

export function Teacher({ onViewResults }) {
  const dispatch = useDispatch()
  const activePoll = useSelector(s => s.poll.activePoll)
  const results = useSelector(s => s.poll.results)
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [timeLimitSec, setTimeLimitSec] = useState(60)
  const [students, setStudents] = useState({})

  const canCreate = useMemo(() => !activePoll || !!activePoll.closedAt, [activePoll])
  const canSubmit = useMemo(() => {
    const validOptions = options.filter(Boolean).length >= 2
    return canCreate && !!question && validOptions
  }, [canCreate, question, options])

  useEffect(() => {
    fetch('/api/polls/students').then(r => r.json()).then(d => setStudents(d.students || {}))
    const handler = (s) => setStudents(s)
    socket.on('server:students', handler)
    return () => socket.off('server:students', handler)
  }, [])

  const addOption = () => setOptions(prev => [...prev, ''])
  const updateOption = (i, val) => setOptions(prev => prev.map((o, idx) => idx===i?val:o))

  const createPoll = () => {
    if (!question || options.filter(Boolean).length < 2) return
    const cleanOptions = options.filter(Boolean)
    socket.emit('teacher:create_poll', { question, options: cleanOptions, timeLimitSec })
    setQuestion('')
    setOptions(['',''])
  }

  const closePoll = () => {
    socket.emit('teacher:close_poll')
  }

  const removeStudent = (socketId) => {
    socket.emit('teacher:remove_student', { socketId })
  }

  return (
    <div className="container">
      <header className="header">
        <div className="pill">Intervue Poll</div>
        <button className="btn btn-ghost" onClick={closePoll} disabled={!activePoll || !!activePoll.closedAt}>Close Active Poll</button>
      </header>

      <section className="card" style={{marginBottom:24}}>
        <h3 className="title">Let's Get Started</h3>
        <p className="subtitle">You'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.</p>
        
        <div className="grid">
          <div>
            <label className="label">Enter your question</label>
            <input className="input" placeholder="Enter your question" value={question} onChange={e=>setQuestion(e.target.value)} />
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'8px'}}>
              <span style={{color:'var(--muted)', fontSize:'12px'}}>{question.length}/100</span>
              <select className="select" value={timeLimitSec} onChange={e=>setTimeLimitSec(Number(e.target.value))} style={{width:'120px'}}>
                <option value={30}>30 seconds</option>
                <option value={60}>60 seconds</option>
                <option value={120}>120 seconds</option>
                <option value={300}>300 seconds</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="label">Edit Options</label>
            {options.map((opt, i) => (
              <div key={i} style={{display:'flex', gap:'8px', marginBottom:'8px'}}>
                <input className="input" placeholder={`Option ${i+1}`} value={opt} onChange={e=>updateOption(i, e.target.value)} />
                <div style={{display:'flex', alignItems:'center', gap:'4px'}}>
                  <input type="radio" name={`correct-${i}`} />
                  <span style={{color:'var(--light)', fontSize:'12px'}}>Is it Correct?</span>
                </div>
              </div>
            ))}
            <button className="btn btn-ghost" onClick={addOption} style={{fontSize:'14px', padding:'8px 16px'}}>+ Add More option</button>
          </div>
          
          <div style={{display:'flex', justifyContent:'flex-end'}}>
            <button className="btn" onClick={createPoll} disabled={!canSubmit} style={{fontSize:'18px', padding:'16px 32px'}}>Ask Question</button>
          </div>
        </div>
      </section>

      {activePoll && (
        <section className="card" style={{marginBottom:24}}>
          <h3 className="title">Question</h3>
          <p style={{color:'var(--light)', fontSize:'18px', marginBottom:'20px'}}><b>{activePoll.question}</b></p>
          {activePoll.options.map((o,i)=> {
            const total = (results || []).reduce((a,b)=>a+(b||0),0)
            const count = results[i]||0
            const pct = total ? Math.round((count/total)*100) : 0
            return (
              <div key={i} className="bar-row">
                <div>
                  <div style={{marginBottom:4, color:'var(--light)'}}>{i+1} {o}</div>
                  <div className="bar"><div className="bar-fill" style={{width:`${pct}%`}}></div></div>
                </div>
                <div className="pill">{count} ({pct}%)</div>
              </div>
            )
          })}
          <div style={{display:'flex', justifyContent:'flex-end', marginTop:'20px'}}>
            <button className="btn" style={{fontSize:'16px', padding:'12px 24px'}}>+ Ask a new question</button>
          </div>
        </section>
      )}

      <section className="card" style={{marginTop:24}}>
        <h3 className="title">Past Polls</h3>
        <PastPolls />
      </section>
    </div>
  )
}


