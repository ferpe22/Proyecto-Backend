const userModel = require('../models/userModel')
const { createHash } = require('../../utils/passwordHash')

class UserManager {
    constructor() {
        this.model = userModel
    }

    async createUser(body) {
        try{
            const newUser = await this.model.create({
                name: body.name,
                lastname: body.lastname,
                email: body.email,
                age: parseInt(body.age),
                password: body.password !== '' ? createHash(body.password) : undefined
            })

            return newUser

        } catch (error) {
            return error
        }
    }

    async getUserByEmail(email) {
        try{
            let user = await this.model.findOne({ email: email })
            return user
        } catch (error) {
            return error
        }
    }

    async getUserById(id) {
        try{
            const user = await this.model.findOne({ _id: id })
            return user.toObject()
        } catch (error) {
            return error
        }
    }

    async getUserByUsername(username) {
        try{
            const user = await this.model.findOne({ name: username })
            return user
        } catch (error) {
            return error
        }
    }

    async deleteAccount(id) {
        try{
            const user = await this.model.findOne({ _id: id })

            if(!user) {
                throw new Error('El usuario no existe')
            } else {
                await this.model.deleteOne({ _id: id })
            }
        } catch (error) {
            return error
        }
    }

    async authenticateUser(user) {
        try {
            const authenticateUser = user.toObject()
            delete authenticateUser.password
            return authenticateUser

        } catch (error) {
            return error
        }
    }

    async resetPassword (email, password) {
        try {
            const user = await this.model.findOne({ email })

            if(!user) {
                throw new Error(`El usuario con el email ${email} no existe`)
            } else {
                const newPassword = createHash(password)
                await this.model.updateOne({ email: user.email }, { password: newPassword })
            }
        } catch (error) {
            return error
        }
    }
}

module.exports = UserManager