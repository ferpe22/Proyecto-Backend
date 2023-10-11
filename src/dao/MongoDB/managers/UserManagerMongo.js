const userModel = require('../models/userModel')
const CartManager = require('./CartManagerMongo')
const cartManager = new CartManager()
const cartModel = require('../models/cartModel')
const { createHash } = require('../../../utils/passwordHash')

class UserManager {
    constructor() {
        this.model = userModel
    }

    async createUser(body) {
      try{
        const newCart = await cartManager.addCart()
        const newUser = await this.model.create({
            name: body.name,
            lastname: body.lastname,
            email: body.email || null,
            age: parseInt(body.age),
            password: body.password !== '' ? createHash(body.password) : undefined,
            cart: newCart._id
        })

        return newUser

      } catch (error) {
          return error
      }
    }

    async getUserByEmail(email) {
        try{
            const user = await this.model.findOne({ email: email })

            return user

        } catch (error) {
            return error
        }
    }

    async getUserById(id) {
      try{
        const user = await this.model.findOne({ _id: id })

        if(!user) {
          throw new Error('El usuario no existe')
        }
        return user.toObject()
      } catch (error) {
          return error
      }
    }

    async getUserByUsername(username) {
      try{
        const user = await this.model.findOne({ name: username })

        if(!user) {
          return null
        }
        
        return user
      } catch (error) {
          return error
      }
    }

    async addToCart(userId, productId) {
      try {
        const user = await this.model.findOne({ _id: userId })
        const cart = await cartManager.getCartById(user.cart)

        if(!cart) {
          throw new Error('El carrito no existe')
        } else {
          await cartManager.addProductToCart(user.cart, productId)
        }
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
                const cart = await cartManager.getCartById(user.cart)
                await cartModel.deleteOne({ _id: cart })
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