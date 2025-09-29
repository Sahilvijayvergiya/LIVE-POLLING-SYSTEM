import { nanoid } from 'nanoid';

export function createStore() {
  /**
   * Structure:
   * {
   *   activePollId: string|null,
   *   polls: {
   *     [pollId]: {
   *       id, question, options: string[], createdAt, closedAt|null,
   *       timeLimitSec: number|null,
   *       answers: { [socketId]: { optionIndex:number, name:string, answeredAt:number } },
   *       results: number[]
   *     }
   *   },
   *   students: { [socketId]: { name:string, joinedAt:number } },
   *   removedStudents: Set<string>
   * }
   */
  const state = {
    activePollId: null,
    polls: {},
    students: {},
    removedStudents: new Set(),
  };

  const getSnapshot = () => ({
    activePollId: state.activePollId,
    polls: state.polls,
    students: state.students,
    removedStudents: new Set(state.removedStudents),
  });

  const getActivePoll = () => state.activePollId ? state.polls[state.activePollId] : null;

  const createPoll = ({ question, options, timeLimitSec }) => {
    if (state.activePollId) {
      throw new Error('Previous poll still active');
    }
    const id = nanoid(10);
    const results = options.map(() => 0);
    state.polls[id] = {
      id,
      question,
      options,
      timeLimitSec: Number.isFinite(timeLimitSec) ? timeLimitSec : null,
      createdAt: Date.now(),
      closedAt: null,
      answers: {},
      results,
    };
    state.activePollId = id;
    return state.polls[id];
  };

  const closeActivePoll = () => {
    const poll = getActivePoll();
    if (!poll) return null;
    poll.closedAt = Date.now();
    state.activePollId = null;
    return poll;
  };

  const submitAnswer = ({ socketId, name, optionIndex }) => {
    const poll = getActivePoll();
    if (!poll) throw new Error('No active poll');
    if (poll.closedAt) throw new Error('Poll closed');
    if (optionIndex < 0 || optionIndex >= poll.options.length) throw new Error('Invalid option');
    // time limit enforcement (default 60s if not configured)
    const limitSec = Number.isFinite(poll.timeLimitSec) && poll.timeLimitSec > 0 ? poll.timeLimitSec : 60;
    const elapsedSec = (Date.now() - poll.createdAt) / 1000;
    if (elapsedSec > limitSec) throw new Error('Time limit exceeded');

    // prevent duplicate; update allowed but counts should adjust once
    const previous = poll.answers[socketId];
    if (previous) {
      poll.results[previous.optionIndex] -= 1;
    }

    poll.answers[socketId] = { optionIndex, name, answeredAt: Date.now() };
    poll.results[optionIndex] += 1;
    return { pollId: poll.id, results: poll.results, answersCount: Object.keys(poll.answers).length };
  };

  const addStudent = (socketId, name) => {
    state.students[socketId] = { name, joinedAt: Date.now() };
  };

  const removeStudent = (socketId) => {
    delete state.students[socketId];
    state.removedStudents.add(socketId);
  };

  const getStudents = () => state.students;

  const listPolls = () => Object.values(state.polls).sort((a,b) => b.createdAt - a.createdAt);

  return {
    getSnapshot,
    getActivePoll,
    createPoll,
    closeActivePoll,
    submitAnswer,
    addStudent,
    removeStudent,
    getStudents,
    listPolls,
  };
}


