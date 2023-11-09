const customError = require('../services/Errors/CustomErrors')
const EErrors = require('../services/Errors/enums')

const isAuthorized = (req, res, next) => {
  if(req.headers && req.headers.cookie && req.headers.cookie.replace('authTokenCookie=', '')) {
    return res.redirect('/profile')
  } 
  
  return next()
}

const authorizationMiddleware = (roles) => {
  return (req, res, next) => {

    if(!roles.includes(req.user.role)) {
      const error = customError.createError({
        name: 'Authorization error',
        cause: 'No tienes autorizacion para consumir este recurso',
        message: 'No tienes autorizacion para consumir este recurso',
        code: EErrors.AUTHORIZATION_ERROR
      })
      
      return next(error)
    }
    
  next()
  }
}

module.exports = {
  isAuthorized,
  authorizationMiddleware
}