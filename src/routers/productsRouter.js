const BaseRouter = require('./BaseRouter')
const ProductsController = require('../controllers/ProductsController')
const productsController = new ProductsController()
const CustomError = require('../services/Errors/CustomErrors')
const { generateProductError } = require('../services/Errors/info')
const EErrors = require('../services/Errors/enums')
const { generateProducts }  = require('../utils/faker')
const numOfProducts = 50
let products = Array.from({ length: numOfProducts }, () => generateProducts())

class ProductsRouter extends BaseRouter {
  init() {
    this.get('/mockingproducts', async (req, res) => {
      res.send({ quantity: products.length, payload: products })
    })
    this.post('/mockingproducts', async (req, res) => {
      try {
        const newProduct = req.body;
        if (
          !newProduct.title ||
          !newProduct.description ||
          !newProduct.code ||
          !newProduct.price ||
          !newProduct.status||
          !newProduct.stock ||
          !newProduct.category
        ) {
          CustomError.createError({
              name: 'Error de creación de producto',
              cause: generateProductError(newProduct),
              message: 'Se produjo un error al intentar crear el producto',
              code: EErrors.INVALID_TYPE_ERROR
          });
        }

        products.push({ ...newProduct, thumbnails: null });

        res.send({ message: 'Producto agregado con éxito', newProduct });

      } catch (error) {
          res.sendError(500, error)
      }
    })
    this.get('/', productsController.getAllProducts.bind(productsController))
    this.get('/:pid', productsController.getProductById.bind(productsController))
    this.post('/', productsController.addProduct.bind(productsController))
    this.put('/:pid', productsController.updateProduct.bind(productsController))
    this.delete('/:pid', productsController.deleteProduct.bind(productsController))
  }
}

module.exports = ProductsRouter
