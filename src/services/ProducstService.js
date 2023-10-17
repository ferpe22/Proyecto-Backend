const ProductsRepository = require('../repositories/ProductsRepositoy')
const CustomErrors = require('../services/Errors/CustomErrors')
const { generateProductError } = require('../services/Errors/info')
const EErrors = require('./Errors/enums')

class ProductsService {
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
      CustomErrors.createError({
        name: 'Error de creación de producto',
        cause: generateProductError(body),
        message: 'Se produjo un error al intentar crear el producto',
        code: EErrors.INVALID_TYPE_ERROR
      })
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

module.exports = ProductsService