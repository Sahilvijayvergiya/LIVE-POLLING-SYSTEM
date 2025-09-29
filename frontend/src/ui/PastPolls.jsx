import React, { useEffect, useState } from 'react'

export function PastPolls() {
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    fetch('/api/polls')
      .then(r => r.json())
      .then(d => { if (mounted) { setPolls(d.polls || []); setLoading(false) }})
      .catch(() => setLoading(false))
    return () => { mounted = false }
  }, [])

  if (loading) return <div className="subtitle">Loading history…</div>

  if (!polls.length) return <div className="subtitle">No past polls yet.</div>

  return (
    <div className="grid">
      {polls.map(p => (
        <div key={p.id} className="card">
          <div className="row" style={{justifyContent:'space-between'}}>
            <b>{p.question}</b>
            <span className="subtitle">{new Date(p.createdAt).toLocaleString()}</span>
          </div>
          <div className="results">
            {p.options.map((o,i)=> {
              const total = (p.results||[]).reduce((a,b)=>a+(b||0),0)
              const count = p.results?.[i] || 0
              const pct = total ? Math.round((count/total)*100) : 0
              return (
                <div key={i} className="bar-row">
                  <div>
                    <div style={{marginBottom:4}}>{o}</div>
                    <div className="bar"><div className="bar-fill" style={{width:`${pct}%`}}></div></div>
                  </div>
                  <div className="pill">{count} ({pct}%)</div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}


