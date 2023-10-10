const Dao = require('../dao/MongoDB/managers/CartManagerMongo')

class CartsRepository {
  constructor() {
    this.dao = new Dao()
  }

  async getAllCarts() {
    return await this.dao.getAllCarts()
  }

  async getCartById(id) {
    return await this.dao.getCartById(id)
  }

  async addCart() {
    return await this.dao.addCart()

  }

  async addProductToCart(cid, pid) {
    return await this.dao.addProductToCart(cid, pid)
  }

  async updateQtyProductInCart(cid, pid, quantity) {
    return await this.dao.updateQtyProductInCart(cid, pid, quantity)
  }

  async updateArrayProductsInCart(cid, newProducts) {
    return await this.dao.updateArrayProductsInCart(cid, newProducts)
  }

  async deleteProductInCart(cid, pid) {
    return await this.dao.deleteProductInCart(cid, pid)
  }

  async deleteAllProductsInCart(cid) {
    return await this.dao.deleteAllProductsInCart(cid)
  }

  async deleteCart(cid) {
    return await this.dao.deleteCart(cid)
  }

  async finishPurchase(data) {
    return await this.dao.finishPurchase(data)
  }
}

module.exports = CartsRepository