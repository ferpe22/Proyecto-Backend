const cartModel = require('../models/cartModel')
const productModel = require('../models/productModel')


class CartManager {
    constructor() {
        this.model = cartModel
    }

    async getAllCarts() {
        try {
            const carts = await this.model.find()
            return carts.map(c => c.toObject())
        } catch (error) {
            throw error
        }
    }

    async getCartById(cid) {
        try {
            const cart = await this.model.findById(cid)
            if(!cart) {
                throw new Error('No se pudo encontrar el carrito seleccionado')
            }
            return cart
        } catch (error) {
            throw error
        }
    }

    async addCart() {
        try {
            const newCart = await this.model.create({ products: []})

            return newCart
        } catch (error) {
            throw error
        }
    }

    async addProductToCart(cid, pid) {
        try {
            const cart = await this.model.findById(cid)
            const product = await productModel.findById(pid)

            if(!product) {
                throw new Error('El producto no se encuentra en el inventario')
            }

            if (!cart) {
                throw new Error('No se encuentra el carrito')
            }

            const existProdInCart = cart.products.findIndex((p) => p.product === pid)
            const productToAdd = {
                product: product.id,
                quantity: 1
            }

            (!existProdInCart !== -1)
                ? cart.products[existProdInCart].quantity++
                : cart.products.push(productToAdd)

            cart.markModified('products')

            cart.save()

        } catch (error) {
            throw error
        }
    }
}

module.exports = CartManager