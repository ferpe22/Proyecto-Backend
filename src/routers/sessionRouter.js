const { Router } = require('express')
const UserManager = require('../dao/DB/UserManagerMongo')


const sessionRouterFn = (io) => {
    const sessionRouter = Router()
    const userManager = new UserManager(io)

    sessionRouter.post('/register', async (req, res) => {
        const newUser = await userManager.createUser(req.body)
        
        return res.redirect('/login')
    })

    sessionRouter.post('/login', async (req, res) => {
        let user = await userManager.getUserByEmail({ email: req.body.email })

        req.session.user = user
        
        return res.redirect('/products')
    })

    return sessionRouter
}

module.exports = sessionRouterFn