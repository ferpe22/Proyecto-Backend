const ProductsRepository = require('../repositories/ProductsRepositoy')

class ProductService {
  constructor() {
    this.repository = new ProductsRepository()
  }

  async getAllProducts(filters, query) {
    return this.repository.getAllProducts(filters, query)
  }

  async getProductById(id) {
    return this.repository.getProductById(id)
  }

  async addProduct(body) {
    const repetido = await this.repository.getProductByCode(body.code)
    
    if (repetido) {
        throw new Error(`Ya existe un producto con el code '${body.code}'`)
    }
    
    if (
      body.title === '' ||
      body.description === '' ||
      body.price === '' ||
      body.thumbnail === '' ||
      body.code === '' ||
      body.stock === '' ||
      body.category === '' ||
      body.status === null ||
      body.status === undefined ||
      body.status === ''
    ) {
      throw new Error('Todos los campos son obligatorios')
    }

    const newProduct = this.repository.addProduct(body)

    return newProduct
  }

  async updateProduct(id, body) {
    return this.repository.updateProduct(id, body)
  }

  async deleteProduct(id) {
    return this.repository.deleteProduct(id)
  }
}

module.exports = ProductService