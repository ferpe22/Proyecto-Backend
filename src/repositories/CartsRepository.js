const getCartsDao = require('../factories/cartsDAOFactory')

class CartsRepository {
  constructor() {
    this.dao = getCartsDao(process.env.STORAGE)
  }

  async getAllCarts() {
    return this.dao.getAllCarts()
  }

  async getCartById(id) {
    return this.dao.getCartById(id)
  }

  async addCart() {
    return this.dao.addCart()
  }

  async addProductToCart(cid, pid, userId) {
    return this.dao.addProductToCart(cid, pid, userId)
  }

  async updateQtyProductInCart(cid, pid, quantity) {
    return this.dao.updateQtyProductInCart(cid, pid, quantity)
  }

  async updateArrayProductsInCart(cid, newProducts) {
    return  this.dao.updateArrayProductsInCart(cid, newProducts)
  }

  async deleteProductInCart(cid, pid) {
    return this.dao.deleteProductInCart(cid, pid)
  }

  async deleteAllProductsInCart(cid) {
    return this.dao.deleteAllProductsInCart(cid)
  }

  async deleteCart(cid) {
    return this.dao.deleteCart(cid)
  }

  async finishPurchase(body) {
    return this.dao.finishPurchase(body)
  }
}

module.exports = CartsRepository