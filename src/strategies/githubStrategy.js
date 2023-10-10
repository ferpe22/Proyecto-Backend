const GitHubSt = require('passport-github2')
const UserManager = require('../dao/MongoDB/managers/UserManagerMongo')
const userManager = new UserManager()
const settings = require('../commands/command')
const { generateToken } = require('../utils/jwt')
require('dotenv').config()
// const GITHUB_CLIENT_ID = settings.clientId;
// const GITHUB_CLIENT_SECRET = settings.clientSecret;


const githubStrategy = new GitHubSt({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: 'http://localhost:8080/api/sessions/github-callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await userManager.getUserByUsername(profile.username)

    if (!user) {
      let data = { name: profile.username, lastname: '', email: profile._json.email, age: 18, password: '' }
      const newUser = await userManager.createUser(data)
      const token = generateToken({
        userId: newUser._id,
        name: newUser.name,
        age: newUser.age,
        role: newUser.role,
        cart: newUser.cart
      })
      newUser.token = token
      return done(null, newUser)
    } else {
        const token = generateToken({
          userId: user._id,
          name: user.name,
          age: user.age,
          role: user.role,
          cart: user.cart
        })
        user.token = token
        return done(null, user)
    }
  } catch (error) {
      return done(error)
  }
})

module.exports = githubStrategy