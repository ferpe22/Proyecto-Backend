const Dao = require('../dao/MongoDB/managers/CartManagerMongo')

class CartsRepository {
  constructor() {
    this.dao = new Dao()
  }

  async getAllCarts() {
    try {
      return this.dao.getAllCarts()
    } catch (error) {
        throw error
    }
  }

  async getCartById(id) {
    try {
      return await this.dao.getCartById(id)
    } catch (error) {
      throw error
    }
  }

  async addCart() {
    try {
      return await this.dao.addCart()
    } catch (error) {
        throw error
    }
  }

  async addProductToCart(cid, pid) {
    try {
      return await this.dao.addProductToCart(cid, pid)
    } catch (error) {
        throw error
    }
  }

  async updateQtyProductInCart(cid, pid, quantity) {
    try {
      return await this.dao.updateQtyProductInCart(cid, pid, quantity)
    } catch (error) {
        throw error
    }
  }

  async updateArrayProductsInCart(cid, newProducts) {
    try {
      return await this.dao.updateArrayProductsInCart(cid, newProducts)
    } catch (error) {
        throw error
    }
  }

  async deleteProductInCart(cid, pid) {
    try {
      return await this.dao.deleteProductInCart(cid, pid)
  } catch (error) {
      throw error
    }
  }

  async deleteAllProductsInCart(cid) {
    try {
      return await this.dao.deleteAllProductsInCart(cid)
  } catch (error) {
      throw error
    }
  }

  async deleteCart(cid) {
    try {
      return await this.dao.deleteCart(cid)
  } catch (error) {
      throw error
    }
  }

  async finishPurchase(data) {
    try {
      return await this.dao.finishPurchase(data)
    } catch (error) {
        throw error
    }
  }
}

module.exports = CartsRepository