export function registerSocketHandlers(io, store) {
  const ROOM = 'global';

  const broadcastState = () => {
    const active = store.getActivePoll();
    io.to(ROOM).emit('server:state', {
      activePoll: active ? {
        id: active.id,
        question: active.question,
        options: active.options,
        createdAt: active.createdAt,
        timeLimitSec: active.timeLimitSec,
        closedAt: active.closedAt,
        results: active.results,
      } : null,
    });
  };

  io.on('connection', (socket) => {
    socket.join(ROOM);

    // identify role and name
    socket.on('client:hello', ({ name, role }) => {
      if (role === 'student') {
        store.addStudent(socket.id, name || 'Anonymous');
        socket.emit('client:ack', { ok: true, socketId: socket.id });
        broadcastState();
        io.to(ROOM).emit('server:students', store.getStudents());
      } else {
        socket.emit('client:ack', { ok: true, socketId: socket.id });
      }
    });

    socket.on('teacher:create_poll', ({ question, options, timeLimitSec }) => {
      try {
        const poll = store.createPoll({ question, options, timeLimitSec });
        io.to(ROOM).emit('server:new_poll', poll);

        if (poll.timeLimitSec && poll.timeLimitSec > 0) {
          setTimeout(() => {
            // close if still active
            const active = store.getActivePoll();
            if (active && active.id === poll.id) {
              const closed = store.closeActivePoll();
              io.to(ROOM).emit('server:poll_closed', closed);
              broadcastState();
            }
          }, poll.timeLimitSec * 1000);
        }
      } catch (e) {
        socket.emit('server:error', { error: e.message });
      }
    });

    socket.on('teacher:close_poll', () => {
      const closed = store.closeActivePoll();
      if (closed) {
        io.to(ROOM).emit('server:poll_closed', closed);
        broadcastState();
      }
    });

    socket.on('teacher:remove_student', ({ socketId }) => {
      store.removeStudent(socketId);
      io.to(socketId).emit('server:removed');
      io.sockets.sockets.get(socketId)?.disconnect(true);
      io.to(ROOM).emit('server:students', store.getStudents());
    });

    socket.on('student:answer', ({ name, optionIndex }) => {
      try {
        const result = store.submitAnswer({ socketId: socket.id, name, optionIndex });
        io.to(ROOM).emit('server:results_update', result);
      } catch (e) {
        socket.emit('server:error', { error: e.message });
      }
    });

    // lightweight chat
    socket.on('chat:message', ({ from, text }) => {
      if (!text) return;
      io.to(ROOM).emit('chat:new_message', { id: Date.now(), from, text, at: Date.now() });
    });

    socket.on('disconnect', () => {
      // remove only if tracked as student
      if (store.getStudents()[socket.id]) {
        store.removeStudent(socket.id);
        io.to(ROOM).emit('server:students', store.getStudents());
      }
    });

    // initial state
    broadcastState();
  });
}


