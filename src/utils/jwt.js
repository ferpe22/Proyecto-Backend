const jwt = require('jsonwebtoken')
//const settings = require('../commands/command')
const JWT_KEY = process.env.JWT_KEY

const generateToken = (payload) => {
  const token = jwt.sign(payload, JWT_KEY, { expiresIn: '1h' })
  return  token
}

const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_KEY, (err, payload) => {
      if (err) {
        return reject(err)
      } else {
        return resolve(payload)
      }
    })
  })
}

module.exports = {
  generateToken,
  verifyToken
}