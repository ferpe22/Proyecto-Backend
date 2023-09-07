const passportLocal = require('passport-local')
const LocalStrategy = passportLocal.Strategy
const UserManager = require('../../dao/DB/UserManagerMongo')
const userManager = new UserManager()
const { isValidPassword } = require('../../utils/passwordHash')

const localLoginStrategy = new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
        try {
            let user = await userManager.getUserByEmail(email)

            if (!user) {
                return done(null, false, { message: 'El usuario no existe' })
            } else if (!isValidPassword(password, user.password)) {
                return done(null, false, { message: 'La contraseña es incorrecta' })
            } else {
                user = await userManager.authenticateUser(user)
                return done(null, user)
            }
            
        } catch (error) {
            return done(error)
        }
    }
    
)

module.exports = localLoginStrategy