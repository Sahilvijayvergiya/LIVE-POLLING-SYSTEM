import React from 'react'
import { PastPolls } from './PastPolls.jsx'

export function ResultsPage({ onBack }) {
  return (
    <div className="container">
      <header className="header">
        <div className="pill">Intervue Poll</div>
        <button className="btn btn-ghost" onClick={onBack}>Back</button>
      </header>
      <section className="card">
        <h3 className="title">Past Poll Results</h3>
        <PastPolls />
      </section>
    </div>
  )
}


