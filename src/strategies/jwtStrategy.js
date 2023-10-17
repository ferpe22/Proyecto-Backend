const passportJWT = require('passport-jwt')
//const settings = require('../commands/command')
const JWT_KEY = process.env.JWT_KEY

const JWTStrategy = passportJWT.Strategy
const extractJWT = passportJWT.ExtractJwt

const headerExtractor = (req) => {
  return req.headers && req.headers.cookie && req.headers.cookie.replace('authTokenCookie=', '')
}

const jwtStrategy = new JWTStrategy({

  jwtFromRequest: extractJWT.fromExtractors([headerExtractor]),
  secretOrKey: `${JWT_KEY}`
}, (jwtPayload, done) => {
    try {
        done(null, jwtPayload)
    } catch (error) {
        return done(error)
    }
})

module.exports = jwtStrategy