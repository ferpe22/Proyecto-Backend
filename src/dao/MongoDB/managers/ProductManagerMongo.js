const productModel = require('../models/productModel')
const ProductsDTO = require('../../dto/ProductsDTO')

class ProductManager {
  constructor() {
    this.model = productModel

  }

  async getAllProducts(filters, query) {
    try {
      //const products = await this.model.find()
      const products = await this.model.paginate(filters, query)
      
      const result = new ProductsDTO(products)
      return result

    } catch (error) {
        throw error
    }
  }

  async getProductById(id) {
    try {
      const product = await this.model.findById(id)
      
      if(product) {
        return product.toObject()
      }

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
    let owner

    try {
      if(body.userId === '1' || !body.userId) {
        owner = 'ADMIN'
      } else {
        owner = body.userId
      }

      const nvoProd = await this.model.create(
        {
          title: body.title,
          description: body.description,
          price: parseFloat(body.price),
          thumbnail: body.thumbnail || [],
          code: body.code,
          stock: body.stock,
          category: body.category,
          status: body.status,
          owner: owner
        })

      return nvoProd

    } catch (error) {
        throw error
    }
  }

  async updateProduct(pid, productData) {
    try {
      const product = await this.getProductById(pid)

      const productUpdated = {
        ...product,
        ...productData
      };

      productUpdated._id = product._id
      
      await this.model.updateOne({ _id: id }, productUpdated);

      return productUpdated

    } catch (error) {
        throw error
    }
  }

  async deleteProduct(pid) {
    try {
      await this.model.deleteOne({ _id: pid })

    } catch (error) {
        throw error
    }
  }
}

module.exports = ProductManager