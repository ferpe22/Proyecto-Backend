const gitHubSt = require('passport-github2')
const UserManager = require('../../dao/DB/UserManagerMongo')
const userManager = new UserManager()

const githubStrategy = new gitHubSt({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await userManager.getUserByUsername(profile.username)

        if (!user) {
            let newUser = { name: profile.username, lastname: '', email: profile._json.email, age: 22, password: '' }
            let userCreated = await userManager.createUser(newUser)
            return done(null, userCreated)
        } else {
            return done(null, user)
        }

    } catch (error) {
        return done(error)
    }
})

module.exports = githubStrategy