const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
  name: String,
  lastname: String,
  email: {
    type: String,
    unique: true
  },
  age: Number,
  password: String,
  role: {
    type: String,
    enum: ['USER', 'PREMIUM', 'ADMIN'],
    default: 'USER'
  },
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'carts'
  },
  createdAt: {
      type: Date,
      default: Date.now
  },
})

module.exports = mongoose.model('users', userSchema)