import mongoose from 'mongoose'

const AnswerSchema = new mongoose.Schema({
  socketId: String,
  name: String,
  optionIndex: Number,
  answeredAt: Number,
}, { _id: false })

const PollSchema = new mongoose.Schema({
  id: { type: String, index: true },
  question: String,
  options: [String],
  timeLimitSec: { type: Number, default: null },
  createdAt: Number,
  closedAt: Number,
  results: [Number],
  answers: { type: Map, of: AnswerSchema },
}, { collection: 'polls' })

export const PollModel = mongoose.models.Poll || mongoose.model('Poll', PollSchema)


