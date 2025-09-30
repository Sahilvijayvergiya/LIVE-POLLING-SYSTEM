import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { PollModel } from './poll.model.js'

export function pollRouter(store) {
  const router = Router();

  // students routes first to avoid being captured by ":id"
  router.get('/students', (req, res) => {
    res.json({ students: store.getStudents() });
  });

  router.delete('/students/:socketId', (req, res) => {
    const { socketId } = req.params;
    store.removeStudent(socketId);
    res.status(StatusCodes.NO_CONTENT).end();
  });

  router.get('/', async (req, res) => {
    const activePollId = store.getSnapshot().activePollId
    try {
      const polls = await PollModel.find().sort({ createdAt: -1 }).lean()
      res.json({ polls, activePollId })
    } catch (e) {
      // fallback to memory if DB not available
      res.json({ polls: store.listPolls(), activePollId })
    }
  });

  router.get('/:id', async (req, res) => {
    const id = req.params.id
    try {
      const doc = await PollModel.findOne({ id }).lean()
      if (doc) return res.json(doc)
    } catch {}
    const p = store.getPoll(id)
    if (!p) return res.status(StatusCodes.NOT_FOUND).json({ error: 'not found' })
    res.json(p)
  })

  router.post('/', (req, res) => {
    const { question, options, timeLimitSec } = req.body || {};
    if (!question || !Array.isArray(options) || options.length < 2) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'question and 2+ options required' });
    }
    try {
      const poll = store.createPoll({ question, options, timeLimitSec });
      // persist immediately
      (async () => {
        try {
          await PollModel.updateOne({ id: poll.id }, poll, { upsert: true })
        } catch {}
      })();
      res.status(StatusCodes.CREATED).json(poll);
    } catch (e) {
      res.status(StatusCodes.CONFLICT).json({ error: e.message });
    }
  });

  router.post('/close', async (req, res) => {
    const poll = store.closeActivePoll();
    if (!poll) return res.status(StatusCodes.NO_CONTENT).end();
    try {
      await PollModel.updateOne({ id: poll.id }, poll, { upsert: true })
    } catch {}
    res.json(poll);
  });

  router.put('/:id', async (req, res) => {
    try {
      const id = req.params.id
      const body = req.body || {}
      const updated = await PollModel.findOneAndUpdate({ id }, body, { new: true })
      if (updated) return res.json(updated)
      const mem = store.updatePoll(id, body)
      if (!mem) return res.status(StatusCodes.NOT_FOUND).json({ error: 'not found' })
      res.json(mem)
    } catch (e) {
      res.status(StatusCodes.CONFLICT).json({ error: e.message })
    }
  })

  router.delete('/:id', async (req, res) => {
    try {
      const id = req.params.id
      const del = await PollModel.deleteOne({ id })
      if (del.deletedCount === 0) {
        const ok = store.deletePoll(id)
        if (!ok) return res.status(StatusCodes.NOT_FOUND).json({ error: 'not found' })
      }
      res.status(StatusCodes.NO_CONTENT).end()
    } catch (e) {
      res.status(StatusCodes.CONFLICT).json({ error: e.message })
    }
  })

  return router;
}


