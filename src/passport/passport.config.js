const passport = require('passport')
const UserManager = require('../dao/DB/UserManagerMongo')
const userManager = new UserManager()
const localRegisterStrategy = require('../passport/strategies/localRegisterStrategy')
const localLoginStrategy = require('../passport/strategies/localLoginStrategy')
const githubStrategy = require('../passport/strategies/githubStrategy')


const InitializePassport = () => {
    passport.use('register', localRegisterStrategy)
    passport.use('login', localLoginStrategy)
    passport.use('github', githubStrategy)

    passport.serializeUser((user, done) => {
        try {
            console.log('serealizeUser')
            done(null, user._id)
        } catch (error) {
            return done(error)
        }
    })

    passport.deserializeUser(async (id, done) => {
        try{
            console.log('deserealizeUser')
            const user = await userManager.getUserById(id)
            done(null, user)
        } catch(error) {
            return done(error)
        }
    })
}

module.exports = InitializePassport