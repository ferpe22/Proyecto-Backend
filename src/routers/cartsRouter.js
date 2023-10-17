const BaseRouter = require('./BaseRouter')
const CartsController = require('../controllers/CartsController')
const cartController = new CartsController()
const passportCall = require('../utils/passportCall')

class CartsRouter extends BaseRouter {
  init() {
    this.get('/', cartController.getAllCarts.bind(cartController))
    this.get('/:cid', cartController.getCartById.bind(cartController))
    this.post('/', cartController.addCart.bind(cartController))
    this.post('/:cid/products/:pid', cartController.addProductToCart.bind(cartController))
    this.post('/:cid/purchase', passportCall('jwt'), cartController.finishPurchase.bind(cartController))
    this.put('/:cid/products/:pid', cartController.updateQtyProductInCart.bind(cartController))
    this.put('/:cid', cartController.updateArrayProductsInCart.bind(cartController))
    this.delete('/:cid/products/:pid', cartController.deleteProductInCart.bind(cartController))
    this.delete('/:cid', cartController.deleteAllProductsInCart.bind(cartController))
  }
}

module.exports = CartsRouter