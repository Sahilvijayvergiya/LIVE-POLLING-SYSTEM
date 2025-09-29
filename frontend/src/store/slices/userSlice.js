import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  name: '',
  role: 'student',
  socketId: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action) {
      state.name = action.payload.name
      state.role = action.payload.role
    },
    setSocketId(state, action) {
      state.socketId = action.payload
    }
  }
})

export const { setUser, setSocketId } = userSlice.actions
export default userSlice.reducer


