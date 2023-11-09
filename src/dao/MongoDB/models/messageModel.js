const mongoose = require('mongoose')

const messagesSchema = mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
  content: {
    type: String,
    required: true,
}
})

module.exports = mongoose.model('messages', messagesSchema)