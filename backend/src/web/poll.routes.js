import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

export function pollRouter(store) {
  const router = Router();

  router.get('/', (req, res) => {
    res.json({ polls: store.listPolls(), activePollId: store.getSnapshot().activePollId });
  });

  router.post('/', (req, res) => {
    const { question, options, timeLimitSec } = req.body || {};
    if (!question || !Array.isArray(options) || options.length < 2) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'question and 2+ options required' });
    }
    try {
      const poll = store.createPoll({ question, options, timeLimitSec });
      res.status(StatusCodes.CREATED).json(poll);
    } catch (e) {
      res.status(StatusCodes.CONFLICT).json({ error: e.message });
    }
  });

  router.post('/close', (req, res) => {
    const poll = store.closeActivePoll();
    if (!poll) return res.status(StatusCodes.NO_CONTENT).end();
    res.json(poll);
  });

  router.get('/students', (req, res) => {
    res.json({ students: store.getStudents() });
  });

  router.delete('/students/:socketId', (req, res) => {
    const { socketId } = req.params;
    store.removeStudent(socketId);
    res.status(StatusCodes.NO_CONTENT).end();
  });

  return router;
}


