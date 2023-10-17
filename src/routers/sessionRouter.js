const BaseRouter = require('./BaseRouter')
const passport = require('passport')
const UserManager = require('../dao/MongoDB/managers/UserManagerMongo')
const UserDto = require('../dao/dto/UserDTO')
const passportCall = require('../utils/passportCall')
const { authorizationMiddleware } = require('../middlewares/usersMiddleware')

const userManager = new UserManager()

class SessionRouter extends BaseRouter {
  init() {
    this.get('/current', passportCall('jwt'), authorizationMiddleware('ADMIN'), (req, res) => {
      try {
        const currentUser = req.user
        const name = currentUser.name
        const lastName = currentUser.lastName || ''
        const age = currentUser.age
        const userDto = new UserDto(name, lastName, age)
        
        res.status(200).json(userDto)

      } catch (error) {
          res.sendError(500, 'No se encuentra el usuario', error)
      }
    })

    this.get('/github', passport.authenticate('github', { scope: ['user:email'] }))

    this.get('/github-callback', passport.authenticate('github', { session: false }), (req, res) => {
      const token = req.user.token

      return res.cookie('authTokenCookie', token, { maxAge: 60*60*1000 }).redirect('/home')
    })

    this.post('/register', passportCall('register'), async (req, res) => {
      try {
        return res.sendSuccess(200, 'Usuario registrado exitosamente!')
      } catch (error) {
        if(!res.headersSent) {
          return res.sendError(500, 'Error al registrar el usuario', error)
        }
      }
    })

    this.post('/', passportCall('login'), async (req, res) => {
      const token = req.user.token
      const user = req.user

      try {
        return res.cookie('authTokenCookie', token, { maxAge: 60*60*1000 }).sendSuccess(200, user)
      } catch (error) {
          return res.sendError(500, 'Error al iniciar sesión', error)
      }
    })

    this.post('/recovery-password', async (req, res) => {
      const { email, password } = req.body
      const contentType = req.headers['content-type']
      
      try {
          await userManager.resetPassword(email, password)

          if (contentType === 'application/json') {
              return res.sendSuccess(200, 'Contraseña reseteada')
          }

          return res.redirect('/')
      } catch (error) {
          if (contentType === 'application/json') {
              return res.sendError(500, 'Error al resetear la contraseña', error)
          } else {
              return res.redirect(`/error?errorMessage=${error.message}`)
          }
      }
    })

    this.delete('/:userId', async (req, res) => {
      const userId = req.params.userId
      const contentType = req.headers['content-type']

      try {
          await userManager.deleteAccount(userId)
          res.clearCookie('authTokenCookie')
          res.sendSuccess(200, 'Cuenta de usuario eliminada') 

      } catch (error) {
          if (contentType === 'application/json') {
              return res.sendError(500, 'Error al eliminar la cuenta', error)
          } else {
              return res.redirect(`/error?errorMessage=${error.message}`)
          }
      }
    })
  }
}


module.exports = SessionRouter