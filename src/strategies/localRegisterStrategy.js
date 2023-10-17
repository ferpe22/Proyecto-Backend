const passportLocal = require('passport-local')
const UserManager = require('../dao/MongoDB/managers/UserManagerMongo')
const userManager = new UserManager()
const CartManager = require('../dao/MongoDB/managers/CartManagerMongo')
const cartManager = new CartManager()
const LocalStrategy = passportLocal.Strategy

const localRegisterStrategy = new LocalStrategy({
  passReqToCallback: true,
  usernameField: 'email'},
  async (req, username, password, done) => {
    const { name, lastname, email, age } = req.body
    
    try {
      let user = await userManager.getUserByEmail(username)

      if (user) {
          return done(null, false, { message: 'El usuario ya existe' })
      }
      
      if (!name || !lastname || !email || !age || !password) {
          return done(null, false, { message: 'Faltan campos por rellenar' })
      }

      let newUser = { name, lastname, email, age, password }
      let userCreated = await userManager.createUser(newUser)
      return done(null, userCreated)

    } catch (error) {
        return done(error)
    }
  }
)

module.exports = localRegisterStrategy