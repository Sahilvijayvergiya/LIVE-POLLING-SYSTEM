import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import { Server } from 'socket.io';
import { pollRouter } from './web/poll.routes.js';
import { createStore } from './store/store.js';
import { registerSocketHandlers } from './websocket/socket-handlers.js';

const PORT = process.env.PORT || 4000;

const app = express();
app.use(helmet());
app.use(cors({ origin: '*'}));
app.use(express.json());

// State store (in-memory; swap with persistent later)
const store = createStore();

// Health and root
app.get('/', (_req, res) => {
  res.type('text/plain').send('Live Polling API');
});
app.get('/healthz', (_req, res) => res.json({ ok: true }));

// HTTP routes
app.use('/api/polls', pollRouter(store));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET','POST'] }
});

// Websocket handlers
registerSocketHandlers(io, store);

server.listen(PORT, () => {
  console.log(`Live Polling backend listening on :${PORT}`);
});


