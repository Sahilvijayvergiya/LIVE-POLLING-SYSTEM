import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setUser } from '../store/slices/userSlice.js'
import { setActivePoll, updateResults, tick } from '../store/slices/pollSlice.js'
import { socket } from '../lib/socket.js'

export function Student() {
  const dispatch = useDispatch()
  const { activePoll, results, secondsRemaining } = useSelector(s => s.poll)
  const [localName, setLocalName] = useState(() => sessionStorage.getItem('studentName') || '')
  const [selected, setSelected] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [kickedOut, setKickedOut] = useState(false)

  useEffect(() => {
    if (localName) {
      dispatch(setUser({ name: localName, role: 'student' }))
      sessionStorage.setItem('studentName', localName)
    }
  }, [localName, dispatch])

  useEffect(() => {
    const onRemoved = () => {
      setKickedOut(true)
      sessionStorage.removeItem('studentName')
      setLocalName('')
      setSubmitted(false)
      setSelected(null)
    }
    socket.on('server:removed', onRemoved)
    return () => socket.off('server:removed', onRemoved)
  }, [])

  // countdown timer when poll active and has time limit
  useEffect(() => {
    if (!activePoll || activePoll.closedAt || !activePoll.timeLimitSec) return
    const interval = setInterval(() => dispatch(tick()), 1000)
    return () => clearInterval(interval)
  }, [activePoll, dispatch])

  const submit = () => {
    if (selected == null) return
    socket.emit('student:answer', { name: localName, optionIndex: selected })
    setSubmitted(true)
  }

  const canAnswer = useMemo(() => activePoll && !activePoll.closedAt && !submitted && (secondsRemaining > 0), [activePoll, submitted, secondsRemaining])

  if (kickedOut) {
    return (
      <div className="container" style={{textAlign:'center', padding:'60px 20px'}}>
        <div className="pill" style={{display:'inline-block', marginBottom:'20px'}}>Intervue Poll</div>
        <h1 style={{fontSize:'32px', fontWeight:'700', color:'var(--text)', margin:'0 0 16px 0'}}>You've been Kicked out !</h1>
        <p style={{color:'var(--muted)', fontSize:'16px', margin:'0'}}>Looks like the teacher had removed you from the poll system. Please Try again sometime.</p>
      </div>
    )
  }

  return (
    <div className="container">
      <header className="header">
        <div className="pill">Intervue Poll</div>
        <div>
          <input className="input" placeholder="Your name" value={localName} onChange={e=>setLocalName(e.target.value)} style={{width:'200px'}} />
        </div>
      </header>

      {activePoll ? (
        <div className="poll-card">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
            <h2 className="poll-question">Question 1</h2>
            {activePoll.timeLimitSec && (
              <div className="poll-timer">00:{secondsRemaining.toString().padStart(2, '0')}</div>
            )}
          </div>
          
          <h3 className="poll-question">{activePoll.question}</h3>
          
          <div style={{marginBottom:'20px'}}>
            {activePoll.options.map((o,i)=> (
              <div key={i} className={`poll-option ${selected===i ? 'selected' : ''}`} onClick={() => canAnswer && setSelected(i)}>
                <input type="radio" name="opt" disabled={!canAnswer} checked={selected===i} onChange={()=>setSelected(i)} />
                <span style={{color:'var(--light)'}}>{o}</span>
              </div>
            ))}
          </div>
          
          <button className="btn" onClick={submit} disabled={!canAnswer} style={{width:'100%'}}>Submit</button>

          {(submitted || activePoll.closedAt) && (
            <div className="results">
              <h4 style={{color:'var(--light)', marginBottom:'16px'}}>Live Results</h4>
              {activePoll.options.map((o,i)=> {
                const total = (results || []).reduce((a,b)=>a+(b||0),0)
                const count = results[i]||0
                const pct = total ? Math.round((count/total)*100) : 0
                return (
                  <div key={i} className="bar-row">
                    <div>
                      <div style={{marginBottom:4, color:'var(--light)'}}>{o}</div>
                      <div className="bar"><div className="bar-fill" style={{width:`${pct}%`}}></div></div>
                    </div>
                    <div className="pill">{count} ({pct}%)</div>
                  </div>
                )
              })}
            </div>
          )}
          
          {submitted && !activePoll.closedAt && (
            <p style={{color:'var(--muted)', textAlign:'center', marginTop:'16px'}}>Wait for the teacher to ask a new question...</p>
          )}
        </div>
      ) : (
        <div style={{textAlign:'center', padding:'60px 20px'}}>
          <div className="pill" style={{display:'inline-block', marginBottom:'20px'}}>Intervue Poll</div>
          <div className="loading-spinner"></div>
          <p style={{color:'var(--muted)', marginTop:'20px'}}>Wait for the teacher to ask questions..</p>
        </div>
      )}
    </div>
  )
}


