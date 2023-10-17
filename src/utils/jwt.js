const jwt = require('jsonwebtoken')
//const settings = require('../commands/command')
const JWT_KEY = process.env.JWT_KEY

const generateToken = (payload) => {
  const token = jwt.sign(payload, JWT_KEY, { expiresIn: '24h' })
  return  token
}

module.exports = {
  generateToken
}