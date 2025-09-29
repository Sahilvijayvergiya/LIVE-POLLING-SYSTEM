import { createSlice } from '@reduxjs/toolkit'

const chatSlice = createSlice({
  name: 'chat',
  initialState: { messages: [], isOpen: false },
  reducers: {
    addMessage(state, action) {
      state.messages.push(action.payload)
    },
    toggleChat(state) {
      state.isOpen = !state.isOpen
    }
  }
})

export const { addMessage, toggleChat } = chatSlice.actions
export default chatSlice.reducer


