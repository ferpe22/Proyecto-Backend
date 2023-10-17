const productModel = require('../models/productModel')
const ProductsDTO = require('../../dto/ProductsDTO')

class ProductManager {
  constructor(io) {
    this.model = productModel
    this.io = io
  }

  async getAllProducts(filters, query) {
    try {
      //const products = await this.model.find()
      const products = await this.model.paginate(filters, query)
      
      // if (products.length === 0) {
      //     throw new Error('No hay productos en el inventario')
      // }
      
      const result = new ProductsDTO(products)
      return result

    } catch (error) {
        throw error
    }
  }

  async getProductById(id) {
    try {
      const product = await this.model.findById(id)
      if(!product) {
          throw new Error('El producto no se encuenta en el inventario')
      }
      return product.toObject()
    } catch (error) {
        throw error
    }
  }

  async getProductByCode(code) {
    try {
      const product = await this.model.findOne({ code: code });

      return product
    } catch (error) {
        throw error
    }
  }

  async addProduct(body) {
    try {
      // if(
      //     body.title === '' ||
      //     body.description === '' ||
      //     body.price=== '' ||
      //     body.thumbnail === '' ||
      //     body.code === '' ||
      //     body.stock === '' ||
      //     body.category === '' ||
      //     body.status === ''
      // ) {
      // throw new Error('Todos los campos son obligatorios')
      // }
      // //Validacion que no se repita el "Code" de los productos
      // const repetido = await productModel.findOne({ code: body.code });
      // if (repetido) {
      //     throw new Error(`Ya existe un producto con el code '${body.code}'`)
      // }

      const nvoProd = await this.model.create(
        {
          title: body.title,
          description: body.description,
          price: body.price,
          thumbnail: body.thumbnail || [],
          code: body.code,
          stock: body.stock,
          category: body.category,
          status: body.status
        })

        if(this.io) {
          this.io.emit('nuevoProducto', JSON.stringify(nvoProd))
        }

    } catch (error) {
        throw error
    }
  }


  async updateProduct(id, body) {
    try {
      const product = await this.getProductById(id)

      // if(!product) {
      //     throw new Error('El producto no existe')
      // }

      const productUpdated = {
        _id: product._id,
        title: body.title || product.title,
        description: body.description || product.description,
        price: body.price || product.price,
        thumbnail: body.thumbnail || product.thumbnail,
        code: body.code || product.code,
        stock: body.stock || product.stock,
        category: body.category || product.category,
        status: body.status || product.status
      }

      await this.model.updateOne({ _id: id }, productUpdated)

      if(this.io) {
        this.io.emit('updateProductView', productUpdated)
      }

      return productUpdated
    } catch (error) {
        throw error
    }
  }

  async deleteProduct(id) {
    try {
      const product = await this.model.findById(id)

      if(!product) {
          throw new Error('El producto no existe')
      }

      await this.model.deleteOne({ _id: id })

      if(this.io) {
        this.io.emit('deleteProductView', id)
      }

      // return true
    } catch (error) {
        throw error
    }
  }
}

module.exports = ProductManager