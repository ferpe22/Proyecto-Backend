const Dao = require('../dao/MongoDB/managers/ProductManagerMongo')

class ProductRepository {
  constructor() {
    this.dao = new Dao()
  }

  async getAllProducts(filters, query) {
    return this.dao.getAllProducts(filters, query)
  }

  async getProductById(pid) {
    return this.dao.getProductById(pid)
  }

  async getProductByCode(code) {
    return this.dao.getProductByCode(code)
  }

  async addProduct(body) {
    return this.dao.addProduct(body)
  }

  async updateProduct(pid, body) {
    return this.dao.updateProduct(pid, body)
  }

  async deleteProduct(pid) {
    return this.dao.deleteProduct(pid)
  }
}

module.exports = ProductRepository
