import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  activePoll: null,
  results: [],
  answersCount: 0,
  secondsRemaining: 60,
}

const pollSlice = createSlice({
  name: 'poll',
  initialState,
  reducers: {
    setActivePoll(state, action) {
      state.activePoll = action.payload
      state.results = action.payload ? (action.payload.results || Array(action.payload.options.length).fill(0)) : []
      state.answersCount = 0
      if (action.payload) {
        const limit = action.payload.timeLimitSec && action.payload.timeLimitSec > 0 ? action.payload.timeLimitSec : 60
        state.secondsRemaining = limit
      }
    },
    updateResults(state, action) {
      state.results = action.payload.results
      state.answersCount = action.payload.answersCount
    },
    tick(state) {
      if (state.secondsRemaining > 0) state.secondsRemaining -= 1
    },
    closePoll(state) {
      if (state.activePoll) {
        state.activePoll.closedAt = Date.now()
      }
    }
  }
})

export const { setActivePoll, updateResults, tick, closePoll } = pollSlice.actions
export default pollSlice.reducer


