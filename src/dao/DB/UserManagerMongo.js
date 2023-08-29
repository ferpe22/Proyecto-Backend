const userModel = require('../models/userModel')

class UserManager {
    constructor(i) {
        this.model = userModel
    }

    async createUser(body) {
        try{
            const newUser = await this.model.create({
                name: body.name,
                lastname: body.lastname,
                email: body.email,
                age: parseInt(body.age),
                password: body.password
            })

            return newUser
            console.log(newUser)
        } catch (error) {
            return error
        }
    }

    async getUserByEmail(email) {
        try{
            let user = await this.model.findOne({ email: email })

            if (!user) {
                return res.status(404).json({ 
                    error: 'User not found' })
            } else if (user.password !== req.body.password) {
                return res.status(401).json({ 
                    error: 'Password incorrect' })
            } else {
                user = user.toObject()
                delete user.password

                return user
            }
        } catch (error) {
            return error
        }

    }
}

module.exports = UserManager