import { configureStore } from '@reduxjs/toolkit'
import userReducer from './slices/userSlice.js'
import pollReducer from './slices/pollSlice.js'
import chatReducer from './slices/chatSlice.js'

export const store = configureStore({
  reducer: {
    user: userReducer,
    poll: pollReducer,
    chat: chatReducer,
  }
})


