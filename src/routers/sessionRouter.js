const { Router } = require('express')
const passport = require('passport')
const UserManager = require('../dao/MongoDB/managers/UserManagerMongo')
const UserDto = require('../dao/dto/UserDTO')
const passportCall = require('../utils/passportCall')
const { authorizationMiddleware } = require('../middlewares/usersMiddleware')


const sessionRouterFn = (io) => {
    const sessionRouter = Router()
    const userManager = new UserManager(io)

    sessionRouter.get('/current', passportCall('jwt'), authorizationMiddleware('ADMIN'), (req, res) => {
        try {
          const currentUser = req.user
          const name = currentUser.name
          const lastName = currentUser.lastName || ''
          const age = currentUser.age
          const userDto = new UserDto(name, lastName, age)
          res.status(200).json(userDto)

        } catch (error) {
            return res.status(500).send( { title: 'Error', message: error.message } )
        }
    })
    
    sessionRouter.get('/github', passport.authenticate('github', { scope: ['user:email'] }))

    sessionRouter.get('/github-callback', passport.authenticate('github', { session: false }), (req, res) => {
      const token = req.user.token

      return res.cookie('authTokenCookie', token, { maxAge: 60*60*1000 }).redirect('/profile')
    })

    sessionRouter.post('/register', passportCall('register'), async (req, res) => {
      try {
        return res.status(200).send('Usuario registrado exitosamente!')
      } catch (error) {
        if(!res.headersSent) {
          return res.status(500).send( { title: 'Error al registrarse', message: error.message } )
        }
      }
    })

    sessionRouter.post('/', passportCall('login'), async (req, res) => {
      const token = req.user.token
      const user = req.user

      try {
        return res.cookie('authTokenCookie', token, { maxAge: 60*60*1000 }).status(201).json({ user })
      } catch (error) {
        return res.status(500).send( { title: 'Error al iniciar sesión', message: error.message } )
      }
    })

    sessionRouter.post('/recovery-password', async (req, res) => {
        const { email, password } = req.body
        const contentType = req.headers['content-type']
        
        try {
            await userManager.resetPassword(email, password)

            if (contentType === 'application/json') {
                return res.status(200).send('Contraseña actualizada')
            }

            return res.redirect('/')
        } catch (error) {
            const commonErrorMessage = 'Error al resetear la contraseña'
            if (contentType === 'application/json') {
                return res.status(500).json({ status: 'error', error: commonErrorMessage, message: error.message })
            } else {
                return res.redirect(`/error?errorMessage=${commonErrorMessage}: ${error.message}`)
            }
        }
    })

    sessionRouter.delete('/:userId', async (req, res) => {
        const userId = req.params.userId
        const contentType = req.headers['content-type']

        try {
            await userManager.deleteAccount(userId)
            res.clearCookie('authTokenCookie')
            res.status(200).json({ status: 'Deleted', message: 'Usuario eliminado' }) 

        } catch (error) {
            const commonErrorMessage = 'Error al eliminar el usuario'
            if (contentType === 'application/json') {
                return res.status(500).json({ status: 'error', error: commonErrorMessage, message: error.message })
            } else {
                return res.redirect(`/error?errorMessage=${commonErrorMessage}: ${error.message}`)
            }
        }
    })

    //revisar endpoint
    sessionRouter.post('/logout', (req, res) => {
        req.session.destroy( error => {
            if(!error) {
                return res.redirect('/')
            }
        })
    })

    return sessionRouter
}

module.exports = sessionRouterFn