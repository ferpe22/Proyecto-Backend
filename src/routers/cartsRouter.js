const { Router } = require('express')
const CartsController = require('../controllers/CartsController')
const passportCall = require('../utils/passportCall')


const cartsRouterFn = (io) => {
    const cartsRouter = Router()
    const cartController = new CartsController(io)

    cartsRouter.get('/', cartController.getAllCarts.bind(cartController))
    cartsRouter.get('/:cid', cartController.getCartById.bind(cartController))
    cartsRouter.post('/', cartController.addCart.bind(cartController))
    cartsRouter.post('/:cid/products/:pid', cartController.addProductToCart.bind(cartController))
    cartsRouter.post('/:cid/purchase', passportCall('jwt'), cartController.finishPurchase.bind(cartController))
    cartsRouter.put('/:cid/products/:pid', cartController.updateQtyProductInCart.bind(cartController))
    cartsRouter.put('/:cid', cartController.updateArrayProductsInCart.bind(cartController))
    cartsRouter.delete('/:cid/products/:pid', cartController.deleteProductInCart.bind(cartController))
    cartsRouter.delete('/:cid', cartController.deleteAllProductsInCart.bind(cartController))

    return cartsRouter
}

module.exports = cartsRouterFn