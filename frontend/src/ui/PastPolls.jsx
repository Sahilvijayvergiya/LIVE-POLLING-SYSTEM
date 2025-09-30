import React, { useEffect, useState } from 'react'

export function PastPolls() {
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState({ question:'', options:[] })

  useEffect(() => {
    let mounted = true
    fetch('/api/polls')
      .then(r => r.json())
      .then(d => { if (mounted) { setPolls(d.polls || []); setLoading(false) }})
      .catch(() => setLoading(false))
    return () => { mounted = false }
  }, [])

  const reload = () => {
    setLoading(true)
    fetch('/api/polls').then(r=>r.json()).then(d=>{ setPolls(d.polls||[]); setLoading(false) })
  }

  const startEdit = (p) => {
    setEditingId(p.id)
    setDraft({ question: p.question, options: [...p.options] })
  }

  const saveEdit = async (id) => {
    await fetch(`/api/polls/${id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(draft) })
    setEditingId(null)
    reload()
  }

  const del = async (id) => {
    await fetch(`/api/polls/${id}`, { method:'DELETE' })
    reload()
  }

  if (loading) return <div className="subtitle">Loading history…</div>

  if (!polls.length) return <div className="subtitle">No past polls yet.</div>

  return (
    <div className="grid">
      {polls.map(p => (
        <div key={p.id} className="card">
          {editingId === p.id ? (
            <>
              <input className="input" value={draft.question} onChange={e=>setDraft(d=>({...d, question:e.target.value}))} />
              {draft.options.map((o,i)=> (
                <input key={i} className="input" style={{marginTop:8}} value={o} onChange={e=>setDraft(d=>{ const n=[...d.options]; n[i]=e.target.value; return {...d, options:n}})} />
              ))}
              <div className="row" style={{justifyContent:'flex-end', marginTop:12}}>
                <button className="btn btn-ghost" onClick={()=>setEditingId(null)}>Cancel</button>
                <button className="btn" onClick={()=>saveEdit(p.id)}>Save</button>
              </div>
            </>
          ) : (
            <>
              <div className="row" style={{justifyContent:'space-between'}}>
                <b>{p.question}</b>
                <span className="subtitle">{new Date(p.createdAt).toLocaleString()}</span>
              </div>
            </>
          )}
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
          <div className="row" style={{justifyContent:'flex-end', marginTop:12}}>
            <button className="btn btn-ghost" onClick={()=>startEdit(p)}>Update</button>
            <button className="btn btn-danger" onClick={()=>del(p.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  )
}


