const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    name: String,
    lastname: String,
    email: String,
    age: Number,
    password: String,
    role: {
        type: String,
        default: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('users', userSchema)