import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Server } from 'socket.io';
import { pollRouter } from './web/poll.routes.js';
import { createStore } from './store/store.js';
import { registerSocketHandlers } from './websocket/socket-handlers.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 4003;

const app = express();
// Relax some Helmet defaults for dev and cross-origin websocket
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
}));
// Explicitly allow Vite dev origins and credentials
const ORIGINS_RAW = process.env.FRONTEND_ORIGIN || 'https://live-polling-system-89i7.onrender.com';
const ALLOWED_ORIGINS = ORIGINS_RAW.split(',').map(s => s.trim());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow non-browser or same-origin
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS: ' + origin));
  },
  credentials: true,
}));
app.use(express.json());

// State store (in-memory; swap with persistent later)
const store = createStore();

// Health and root
app.get('/', (_req, res) => {
  res.type('text/plain').send('Server is running...');
});
app.get('/healthz', (_req, res) => res.json({ ok: true }));

// HTTP routes
app.use('/api/polls', pollRouter(store));

let io; // will be initialized after the server starts

async function start() {
  let uri = process.env.MONGODB_URI;
  if (!uri) {
    const username = process.env.MONGODB_USERNAME;
    const password = process.env.MONGODB_PASSWORD;
    const hosts = process.env.MONGODB_HOSTS || process.env.MONGODB_HOST;
    const dbName = process.env.MONGODB_DB || process.env.MONGODB_DATABASE;
    if (username && password && hosts && dbName) {
      uri = `mongodb+srv://${encodeURIComponent(username)}:${encodeURIComponent(
        password
      )}@${hosts}/${dbName}?retryWrites=true&w=majority`;
      console.log('Composed MONGODB_URI from separate env vars');
    }
  }

  if (uri) {
    try {
      await mongoose.connect(uri);
      console.log('MongoDB connected');
    } catch (err) {
      console.warn('MongoDB connection failed, continuing in in-memory mode:', err?.message);
    }
  } else {
    console.warn('No MongoDB URI provided. Running in in-memory mode.');
  }

  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Handle port already in use
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Please free the port or use a different one.`);
    } else {
      console.error(err);
    }
    process.exit(1);
  });

  io = new Server(server, {
    cors: {
      origin: ALLOWED_ORIGINS,
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });
  registerSocketHandlers(io, store);
}

start();
