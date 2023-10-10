const passport = require('passport')
const localRegisterStrategy = require('../strategies/localRegisterStrategy')
const localLoginStrategy = require('../strategies/localLoginStrategy')
const githubStrategy = require('../strategies/githubStrategy')
const jwtStrategy = require('../strategies/jwtStrategy')

const UserManager = require('../dao/MongoDB/managers/UserManagerMongo')
const userManager = new UserManager()


const initializePassport = () => {
  passport.use('register', localRegisterStrategy)
  passport.use('login', localLoginStrategy)
  passport.use('github', githubStrategy)
  passport.use('jwt', jwtStrategy)

  passport.serializeUser((user, done) => {
      try {
          console.log('serealizeUser')
          done(null, user._id)
      } catch (error) {
          return done(error)
      }
  })

  passport.deserializeUser(async (id, done) => {
      try{
          console.log('deserealizeUser')
          const user = await userManager.getUserById(id)
          done(null, user)
      } catch(error) {
          return done(error)
      }
  })
}

module.exports = initializePassport