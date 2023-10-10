const { Router } = require('express')
const ProductsController = require('../controllers/ProductsController')


const productsRouterFn = (io) => {
    const productsRouter = Router()
    const productsController = new ProductsController(io)

    productsRouter.get('/', productsController.getAllProducts.bind(productsController))
    productsRouter.get('/:pid', productsController.getProductById.bind(productsController))
    productsRouter.post('/', productsController.addProduct.bind(productsController))
    productsRouter.put('/:pid', productsController.updateProduct.bind(productsController))
    productsRouter.delete('/:pid', productsController.deleteProduct.bind(productsController))

    return productsRouter
}

module.exports = productsRouterFn
