const passport = require('passport')

const passportCall = (strategy) => {
  return (req, res, next) => {
    passport.authenticate(strategy, (error, user, info) => {
      if(error) {
        return next(error)
      }

      if(!user) {
        const errorMessage = (info && info.message) ? info.message : info ? info.toString() : 'Authentication failed'
        return res.status(401).send({ error: errorMessage })
      }

      req.user = user
      next()
    })(req, res, next)
  }
}

module.exports = passportCall