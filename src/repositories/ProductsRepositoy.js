const getProductsDao = require('../factories/productsDAOFactory')

class ProductsRepository {
  constructor() {
    this.dao = new getProductsDao(process.env.STORAGE)
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

  async updateProduct(pid, productData) {
    return this.dao.updateProduct(pid, productData)
  }

  async deleteProduct(pid) {
    return this.dao.deleteProduct(pid)
  }

  async saveProduct(pid) {
    return this.dao.saveProduct(pid)
  }
}

module.exports = ProductsRepository
