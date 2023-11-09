const BaseRouter = require('./BaseRouter')
const ProductsController = require('../controllers/ProductsController')
const CustomError = require('../services/Errors/CustomErrors')
const { generateProductError } = require('../services/Errors/info')
const EErrors = require('../services/Errors/enums')
const { generateProducts }  = require('../utils/faker')
const numOfProducts = 50
let products = Array.from({ length: numOfProducts }, () => generateProducts())

class ProductsRouter extends BaseRouter {
  constructor(io) {
    super();
    this.io = io
    this.productsController = new ProductsController(io)
  }
  init() {
    this.get('/mockingproducts', async (req, res) => {
      res.send({ quantity: products.length, payload: products })
    })
    this.post('/mockingproducts', async (req, res) => {
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
          const error = CustomError.createError({
            name: 'Error de creación de producto',
            cause: generateProductError(newProduct),
            message: 'Se produjo un error al intentar crear el producto',
            code: EErrors.INVALID_TYPE_ERROR
          });

          return next(error)
        }

        products.push({ ...newProduct, thumbnails: null });

        res.send({ message: 'Producto agregado con éxito', newProduct });
    });

    this.get('/', (req, res) => this.productsController.getAllProducts(req, res))
    this.get('/:pid', (req, res, next) => this.productsController.getProductById(req, res, next))
    this.post('/', /*uploader.arrya('thumbnails'),*/ (req, res, next) => this.productsController.addProduct(req, res, next))
    this.put('/:pid', (req, res) => this.productsController.updateProduct(req, res))
    this.delete('/:pid', (req, res) => this.roductsController.deleteProduct(req, res))
  }
}

module.exports = ProductsRouter
