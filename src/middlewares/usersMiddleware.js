const isAuthorized = (req, res, next) => {
  if(req.headers && req.headers.cookie && req.headers.cookie.replace('authTokenCookie=', '')) {
    return res.redirect('/profile')
  } 
  
  return next()
}

const authorizationMiddleware = (roles) => {
  return (req, res, next) => {
    const contentType = req.headers['content-type']

    if(!req.user) {
      if (contentType === 'application/json') {
        return res.status(401).json({ error: 'Debes iniciar sesión para acceder a esta sección' })
      }
      return res.redirect('/')
    }

    if(!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'No tenes permiso para acceder a este recurso' })
    }
    next()
  }
}

module.exports = {
  isAuthorized,
  authorizationMiddleware
}