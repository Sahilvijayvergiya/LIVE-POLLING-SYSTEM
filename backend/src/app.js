import express from 'express'

const app = express()

app.use(express.json())

app.get('/', (_req, res) => {
  res.type('text/plain').send('Server is running...')
})

app.get('/healthz', (_req, res) => {
  res.json({ ok: true })
})

export default app


