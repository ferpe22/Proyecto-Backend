const { ne } = require('@faker-js/faker')
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

  async getProductById(pid) {
    return this.repository.getProductById(pid)
  }

  async addProduct(body) {
    const repetido = await this.repository.getProductByCode(body.code)
    
    if (repetido) {
      const error = CustomErrors.createError({
        name: 'Error de creación de producto',
        cause: `Ya existe un producto con el code '${body.code}'`,
        message: `Ya existe un producto con el code '${body.code}'`,
        code: EErrors.DATABASE_ERROR
      })
        throw error
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

      const error = CustomErrors.createError({
        name: 'Error de creación de producto',
        cause: generateProductError(body),
        message: 'Se produjo un error al intentar crear el producto',
        code: EErrors.INVALID_TYPE_ERROR
      })
      throw error
    }

    const newProduct = this.repository.addProduct(body)

    return newProduct
  }

  async updateProduct(pid, productData, userId) {
    const product = await this.repository.getProductById(id)

    if(!product) {
      const error = CustomErrors.createError({
        name: 'Error de actualización de producto',
        cause: `El producto con id ${id} no se encuentra en el inventario`,
        message: `El producto con id ${id} no se encuentra en el inventario`,
        code: EErrors.DATABASE_ERROR
      })

      throw error
    }

    if (userId !== '1' && userId && userId !== product.owner) {
      throw new Error('No tienes permisos para actualizar este producto')
    }

    return this.repository.updateProduct(pid, productData)
  }

  async saveProduct(pid) {
    return this.repository.saveProduct(pid)
  }

  async deleteProduct(pid, userId) {
    const product = await this.repository.getProductById(pid)

    if(!product) {
      throw new Error('El producto no se encuentra en el inventario')
    }

    if(userId !== '1' && userId && userId !== product.owner) {
      throw new Error('No tienes permisos para borrar este producto')
    }

    return this.repository.deleteProduct(pid)
  }
}

module.exports = ProductsService