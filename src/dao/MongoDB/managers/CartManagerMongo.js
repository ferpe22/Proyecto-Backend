const cartModel = require('../models/cartModel')
const productModel = require('../models/productModel')
const TicketManager = require('./TicketManagerMongo')
const ticketManager = new TicketManager()
const CustomError = require('../../../services/Errors/CustomErrors')
const { generateNotFoundError } = require('../../../services/Errors/info')
const EErrors = require('../../../services/Errors/enums')

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

  async getCartById(id) {
    try {
      const cart = await this.model.find({ _id: id }) 
      
      return cart
    } catch (error) {
        throw error
    }
  }

  async addCart() {
    try {
      const newCart = await this.model.create({})

      return newCart
    } catch (error) {
        throw error
    }
  }

  async addProductToCart(cid, pid, userId) {
    try {
      const cart = await this.model.findById(cid)
      const product = await productModel.findById(pid)

      if (!cart) {
        CustomError.createError({
          name: 'Error de agregado de producto al carrito',
          cause: generateNotFoundError(cid, 'cart'),
          message: 'Carrito no encontrado',
          code: EErrors.DATABASE_ERROR

        })
      }

      if(!product) {
        CustomError.createError({
          name: 'Error de agregado de producto al carrito',
          cause: generateNotFoundError(pid, 'product'),
          message: 'Producto no encontrado en inventario',
          code: EErrors.DATABASE_ERROR

        })
      }

      if (userId !== '1' && !userId && userId === product.owner) {
        throw new Error('Sos el propietario del producto')
      }

      const existProdInCart = cart.products.findIndex((p) => p.product._id.toString() === pid);

      const productToAdd = {
          product: pid,
          quantity: 1
      };

      (existProdInCart !== -1)
          ? cart.products[existProdInCart].quantity++
          : cart.products.push(productToAdd);

      await cart.save();

    } catch (error) {
        throw error
    }
  }

  async updateQtyProductInCart(cid, pid, quantity) {
    try {
      const cart = await this.model.findById(cid)

      await this.model.updateOne(
          { _id: cart._id, 'products.product': pid },
          { $set: { 'products.$.quantity': quantity } }
      );
  
    } catch (error) {
        throw error
    }
  }
  
  async updateArrayProductsInCart(cid, newProducts) {
    try{
      const cart = await this.model.findById(cid)

      await this.model.updateOne(
          { _id: cart._id },
          { $set: { products: newProducts } }
      )

    } catch (error) {
        throw error
    }
  }

  async deleteProductInCart(cid, pid) {
    try {
      const cart = await this.model.findById(cid)

      await this.model.updateOne(
          { _id: cart._id },
          { $pull: { products: { product: pid } } }
      );

    } catch (error) {
        throw error
    }
  }

  async deleteAllProductsInCart(cid) {
    try {
      const cart = await this.model.findById(cid)

      await this.model.updateOne(
          { _id: cart._id },
          { $set: { products: [] } }
      );

    } catch (error) {
        throw error
    }
  }

  /*async deleteCart(cid) {
    try {
      const cart = await this.model.findById(cid)

      await this.model.deleteOne(
          { _id: cart._id }
      );

    } catch (error) {
        throw error
    }
  }*/

  async finishPurchase(data) {
    try {
      const newOrder = await ticketManager.createOrder({
        amount: data.amount,
        purchaser: data.purchaser
      })
      return {
        purchaser: newOrder.purchaser,
        prodWithoutStock: data.prodWithoutStock,
        amount: newOrder.amount
      }
    } catch (error) {
      throw error
    }
  }

  async saveCart(cart) {
    try {
      await this.model.updateOne({ _id: cart._id }, cart );

      return cart
    } catch (error) {
      throw error
    }
  }
}

module.exports = CartManager