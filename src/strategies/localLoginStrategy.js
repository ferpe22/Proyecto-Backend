const passportLocal = require('passport-local')
const LocalStrategy = passportLocal.Strategy
const UserManager = require('../dao/MongoDB/managers/UserManagerMongo')
const userManager = new UserManager()
const { isValidPassword } = require('../utils/passwordHash')
const { generateToken } = require('../utils/jwt')

const customUser = {
  userId: '1',
  name: 'Usuario',
  lastname: 'Admin',
  email: 'userAdmin@mail.com',
  password: 'qwerty',
  role: 'ADMIN',
  age: 40,
}; 

const localLoginStrategy = new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      if (customUser.email === email && customUser.password === password) {
        const token = generateToken({
          userId: customUser.userId,
          role: customUser.role,
          name: customUser.name,
          lastname: customUser.lastname,
          email: customUser.email,
          age: customUser.age
        })

        customUser.token = token
        return done(null, customUser)        
      }

      let user = await userManager.getUserByEmail(email)

      if (!user) {
          return done(null, false, { message: 'El usuario no existe en el sistema' })
      }
      
      if (!isValidPassword(password, user.password)) {
          return done(null, false, { message: 'La contraseña es incorrecta' })
      }

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

    } catch (error) {
        return done(error)
    }
  }
)

module.exports = localLoginStrategy