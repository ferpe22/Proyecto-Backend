const BaseRouter = require('./BaseRouter')
const ProductManager = require('../dao/MongoDB/managers/ProductManagerMongo')
const CartManager = require('../dao/MongoDB/managers/CartManagerMongo')
const passportCall = require('../utils/passportCall')
const { authorizationMiddleware, isAuthorized } = require('../middlewares/usersMiddleware')
const { verifyToken } = require('../utils/jwt')

const productManager = new ProductManager()
const cartManager = new CartManager()

class ViewsRouter extends BaseRouter {
  handleProductsRoutes = async (req, res, viewName) => {
    const user = req.user
    const filters = {}
    const { page = 1, limit = 5, sort, category, availability } = req.query
    const sortOption = sort === 'asc' ? { price: 1 } : sort === 'desc' ? { price: -1 } : {};
    const availabilityOption = availability === 'available' ? true : availability === 'unavailable' ? false : undefined;
    const query = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sortOption,
    };

    if (category) {
      filters.category = category;
    }

    if (availability) {
      filters.status = availabilityOption;
    }

    try {
      const productData = await productManager.getAllProducts(filters, query);
      const products = productData.products.map(p=> p.toObject());
      const locals = {
        title: viewName === 'productsViews/products' ? 'Products' : 'Real Time Products',
        products: products,
        productData,
        user,
        generatePaginationLink: (page) => {
          const newQuery = { ...req.query, ...filters, page: page };
          return `/${viewName.split('/')[1]}?` + new URLSearchParams(newQuery).toString();
        }
      }

      res.renderView({ view: viewName, locals: locals })

    } catch (error) {
        res.renderView({ view: 'error', locals: { title: 'Error', errorMessage: error.message }})
    }
  }

  init() {

    //PRODUCTOS
    this.get('/home', passportCall('jwt'), authorizationMiddleware(['ADMIN', 'USER', 'PREMIUM']), async (req, res) => {
      const user = req.user
      let title = 'VendemosTodo'
      let roles = []

      if(user.roles === 'PREMIUM') {
        roles.premiumRole = true
      } else if (user.role === 'ADMIN') {
        roles.adminRole = true
      } else {
        roles.userRole = true
      }
      
      try{
        res.renderView({ view: 'home', locals: { title, user, roles } })
      } catch (error) {
          return res.renderView({ view: 'error', locals: { title: 'Error', errorMessage: error.message }})
        }
    })

    this.get('/realtimeproducts', passportCall('jwt'), authorizationMiddleware(['ADMIN', 'PREMIUM']), async (req, res) => {
      this.handleProductsRoutes(req, res, 'productsViews/realTimeProducts')
    })

    this.get('/products', passportCall('jwt'), authorizationMiddleware(['USER', 'PREMIUM']), async (req, res) => {
      this.handleProductsRoutes(req, res, 'productsViews/products')
    })

    this.get('/products/:pid', passportCall('jwt'), authorizationMiddleware(['USER', 'PREMIUM']), async (req, res) => {
      const user = req.user
      const pid = req.params.pid
      try {
          const product = await productManager.getProductById(pid)
  
          res.renderView({ view: 'productsViews/productDetail', locals: { title: 'Product Detail', product, user } })
      } catch (error) {
          res.renderView({ view: 'error', locals: { title: 'Error', errorMessage: error.message } })
      }
    })

    this.get('/carts/:cid', passportCall('jwt'), authorizationMiddleware(['USER', 'PREMIUM']), async (req, res) => {
      const user = req.user
      const cid = req.params.cid
      try {
        const cart = await cartManager.getCartById(cid)
  
        if(req.user.cart !== cid) {
          const errorMessage = 'No tenes permitado acceder a este carrito'
          res.renderView({ view: 'error', locals: { title: 'Error', errorMessage: errorMessage } })
        }
  
        const productsInCart = cart[0].products.map(p => p.toObject())
        let { totalQuantity, totalPrice } = productsInCart.reduce((acc, item) => {
          acc.totalQuantity += item.quantity;
          acc.totalPrice += item.quantity * item.product.price;
  
          return acc
        }, { totalQuantity: 0, totalPrice: 0 });

        totalPrice = totalPrice.toFixed(2);
  
        if(cart[0].products.length === 0) {
          const noProducts = true
          res.renderView({ view: 'productsViews/cartDetail', locals: { title: 'Cart Detail', noProducts, user } })
        } else {
          res.renderView({ view: 'productsViews/cartDetail', locals: { title: 'Cart Detail', productsInCart, user, totalPrice , totalQuantity} })
        }
      } catch (error) {
        res.renderView({ view: 'error', locals: { title: 'Error', errorMessage: error.message } })
      }
    })

    this.get('/carts/:cid/purchase', passportCall('jwt'), authorizationMiddleware(['USER', 'PREMIUM']), async (req, res) => {
      const user = req.user
      const cid = req.params.cid
      try {
        const cart = await cartManager.getCartById(cid)
  
        if(req.user.cart != cid){
          const errorMessage = 'No tenes permitado acceder a este carrito'
          res.renderView({ view: 'error', locals: { title: 'Error', errorMessage: errorMessage } })
        }
  
        const productsInCart = cart[0].products.map((item) => {
          const product = item.product
          const quantity = item.quantity
          const totalProductPrice = product.price * quantity
          return { product: product.toObject(), quantity, totalProductPrice }
        })
  
        const { totalQuantity, totalPrice } = cart[0].products.reduce((acc, item) => {
          acc.totalQuantity += item.quantity;
          acc.totalPrice += item.quantity * item.product.price;
  
          return acc
        }, { totalQuantity: 0, totalPrice: 0 });
  
        res.renderView({ view: 'productsViews/checkout', locals: { title: 'Checkout', user, productsInCart, totalPrice, totalQuantity } })
  
      } catch (error) {
        res.renderView({ view: 'error', locals: { title: 'Error', errorMessage: error.message } })
      }
    })

    //REGISTRO Y LOGIN
    this.get('/register', isAuthorized, async (req, res) => {
      try {
          res.renderView({ view: 'loginViews/register', locals: { title: 'Registro'} })
      } catch (error) {
          res.renderView({ view: 'error', locals: { title: 'Error', errorMessage: error.message } })
      }
    })

    this.get('/', isAuthorized, async (req, res) => {
      try {
          res.renderView({ view: 'loginViews/login', locals: { title: 'Login'} })
      } catch (error) {
          res.renderView({ view: 'error', locals: { title: 'Error', errorMessage: error.message } })
      }
    })

    this.get('/recoverypassword', isAuthorized, async (req, res) => {
      try {
          res.renderView({ view: 'loginViews/recoveryPassword', locals: { title: 'Recuperar contraseña'} })
      } catch (error) {
          res.renderView({ view: 'error', locals: { title: 'Error', errorMessage: error.message } })
      }
    })

    this.get('/password/reset/:token', isAuthorized, async (req, res) => {
      const { token } = req.params
      
      try {
        await verifyToken(token)
        res.renderView({ view: 'loginViews/reset', locals: { title: 'Reestablecer contraseña'} })
      } catch (error) {
          if(error.message === 'jwt expired') {
            error.message = 'El link para resetar la contraseña ha expirado'
          }
          res.renderView({ view: 'error', locals: { title: 'Error', errorMessage: error.message } })
      }
    })

    this.get('/profile', passportCall('jwt'), authorizationMiddleware(['USER', 'ADMIN', 'PREMIUM']) , async (req, res) => {
      const user = req.user
      try {
        res.renderView({ view: 'loginViews/profile', locals: { user, title: 'Perfil' } })
      } catch (error) {
          res.renderView({ view: 'error', locals: { title: 'Error', errorMessage: error.message } })
      }
    })

    this.get('/logout', async (req, res) => {
      try{
        res.clearCookie('authTokenCookie')
        res.redirect('/')
  
      } catch (error) {
        res.renderView({ view: 'error', locals: { title: 'Error', message: error.message } })
      }
    })

    //CHAT
    this.get('/chat', passportCall('jwt'), authorizationMiddleware('USER'), async (req, res) => {
      try {
        res.renderView({ view: 'chat', locals: { title: 'Chat' } })
      } catch (error) {
          res.renderView({ view: 'error', locals: { title: 'Error', errorMessage: error.message } })
      }
    })

    //OTRAS
    this.get('/error', (req, res) => {
      const errorMessage = req.query.errorMessage || 'Ha ocurrido un error'
      res.renderView({ view: 'error', locals: { title: 'Error', errorMessage: errorMessage } })
    })

    this.get('*', (req, res) => {
      res.renderView({ view: 'notFound', locals: { title: 'No encontrado' } })
    })
  }
}

module.exports = ViewsRouter

