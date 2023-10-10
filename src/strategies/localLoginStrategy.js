const passportLocal = require('passport-local')
const LocalStrategy = passportLocal.Strategy
const UserManager = require('../dao/MongoDB/managers/UserManagerMongo')
const userManager = new UserManager()
const { isValidPassword } = require('../utils/jwt')

const localLoginStrategy = new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      let user = await userManager.getUserByEmail(email)

      if (!user) {
          return done(null, false, { message: 'El usuario no existe en el sistema' })
      } else if (!isValidPassword(password, user.password)) {
          return done(null, false, { message: 'La contraseña es incorrecta' })
      } else {
        user = await userManager.authenticateUser(user)
        const token = generateToken({
          userId: user._id,
          role: user.role,
          name: user.name,
          lastname: user.lastname,
          email: user.email,
          age: user.age,
          cart: user.cart
        })
        user.token = token
        return done(null, user)
      }
    } catch (error) {
        return done(error)
    }
  }
)

module.exports = localLoginStrategy