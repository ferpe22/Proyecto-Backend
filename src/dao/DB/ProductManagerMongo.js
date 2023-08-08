const productModel = require('../models/productModel')

class ProductManager {
    constructor() {
        this.model = productModel
    }

    async getAllProducts() {
        const products = await this.model.find()
        return products.map(p => p.toObject())

    }

    async getProductById(id) {
        return this.model.findById(id)
    }

    async addProduct(body) {
        return this.model.create({
            title: body.title,
            description: body.description,
            price: body.price,
            thumbnail: body.thumbnail,
            code: body.code,
            stock: body.stock,
            category: body.category,
            status: body.status
        })

    }

    async updateProduct(id, body) {
        const product = await this.getProductById(id)

        if(!product) {
            throw new Error('El producto no existe')
        }

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

        return productUpdated
    }

    async deleteProduct(id) {
        const product = await this.getProductById(id)

        if(!product) {
            throw new Error('El producto no existe')
        }

        await this.model.deleteOne({ _id: id })

        return true
    }
}

module.exports = ProductManager