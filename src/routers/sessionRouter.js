const BaseRouter = require('./BaseRouter')
const passport = require('passport')
const UserManager = require('../dao/MongoDB/managers/UserManagerMongo')
const UserDto = require('../dao/dto/UserDTO')
const passportCall = require('../utils/passportCall')
const { authorizationMiddleware } = require('../middlewares/usersMiddleware')
const transportGmail = require('../config/nodemailer.config')
const settings = require('../commands/command')
const { generateToken, verifyToken } = require('../utils/jwt')

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
        return res.sendSuccess(201, 'Usuario registrado exitosamente!')
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
        return res.cookie('authTokenCookie', token, { maxAge: 60*60*1000 }).sendSuccess(201, user)
      } catch (error) {
          return res.sendError(500, 'Error al iniciar sesión', error)
      }
    })

    this.post('/recoveryPassword', async (req, res) => {
      const { email } = req.body
      
      try {
        const user = await userManager.getUserByEmail(email)

        if (!user) {
          return res.sendError(404, 'El email ingresado no corresponde a un usuario registrado')
        }

        const token = generateToken({ userId : user._id })

        const resetLink = `http://localhost:8080/password/reset/${token}`

        await transportGmail.sendMail({
          from: `VendemosTodo <${settings.emailUser}>`,
          to: user.email,
          subject: 'Restablecer contraseña',
          html: `<div>
                    <h1>Restablecer contraseña</h1>
                    <button><a href="${resetLink}">Reset Password</a></button>
                </div>`,
          attachments: []
        })

        return res.sendSuccess(200, 'Email enviado con éxito')

      } catch (error) {
          return res.sendError(500, 'Error al enviar el email')
      }
    })

    this.post('/password/reset/:token', async (req, res) => {
      const { token } = req.params
      const { newPassword } = req.body

      try {
        const decodedToken = await verifyToken(token)
        const userId = decodedToken.userId

        await userManager.resetPassword(userId, newPassword)

        return res.sendSuccess(200, 'Contraseña cambiada')
      } catch (error) {
        if (error.message === 'La nueva contrasea no puede ser igual a la anterior') {
          return res.sendError(409, error.message)
        }
        
        if (error.message === 'El usuario con el email no existe') {
          return res.sendError(404, error.message)
        }

        return res.sendError(500, 'Error al resetear la contraseña')

        }
    })

    this.put('/premium/:uid', async (req, res) => {
      const uid = req.params.uid
      const { newRole } = req.body

      try {
        const user = await userManager.updateUserRole(uid, newRole)

        return res.sendSuccess(200, user)
      } catch (error) {
        return res.sendError(500, 'Error al cambiar el rol')
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