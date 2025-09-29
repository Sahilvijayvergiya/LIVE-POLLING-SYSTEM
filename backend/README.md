# Live Polling Backend

## Scripts
- dev: `npm run dev`
- start: `npm start`

## Env
- PORT (default 4000)

## Run locally
```bash
cd backend
npm i
npm run dev
```

## API
- GET `/api/polls` → `{ polls, activePollId }`
- POST `/api/polls` body: `{ question, options, timeLimitSec? }`
- POST `/api/polls/close`
- GET `/api/polls/students`
- DELETE `/api/polls/students/:socketId`

## WebSocket events
- client → server
  - `client:hello` `{ name, role }`
  - `teacher:create_poll` `{ question, options, timeLimitSec? }`
  - `teacher:close_poll`
  - `teacher:remove_student` `{ socketId }`
  - `student:answer` `{ name, optionIndex }`
  - `chat:message` `{ from, text }`
- server → client
  - `server:state` `{ activePoll }`
  - `server:new_poll` poll
  - `server:results_update` `{ pollId, results, answersCount }`
  - `server:poll_closed` poll
  - `server:students` map
  - `server:error` `{ error }`
  - `client:ack` `{ ok, socketId }`
  - `chat:new_message` `{ id, from, text, at }`

## Deployment
- Any Node host (Render, Railway, EC2). Ensure CORS allows frontend origin.
- `npm ci && npm start` with `PORT` set by host.
