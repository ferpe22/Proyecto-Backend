const { Router } = require('express')
const ProductManager = require('../dao/MongoDB/managers/ProductManagerMongo')
const CartManager = require('../dao/MongoDB/managers/CartManagerMongo')
const passportCall = require('../utils/passportCall')
const { authorizationMiddleware, isAuthorized } = require('../middlewares/usersMiddleware')
//const ProductManager = require('../dao/FileSystem/ProductManager')
const { openSession, needLogin, requireAdmin } = require('../middlewares/sessionMiddleware')


const viewsRouterFn = (io) => {
  const viewsRouter = Router()
  const productManager = new ProductManager(io)
  const cartManager = new CartManager(io)

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

      res.renderView({ viewName: viewName, locals: locals })

    } catch (error) {
      res.render({ title: 'Error', message: error.message })
    }

  }

  //VISTAS DE REGISTRO Y LOGIN DE USUARIOS
  viewsRouter.get('/register', isAuthorized , async (req, res) => {
      try {
          return res.render('loginViews/register', { locals: { title: 'Registro'} })
      } catch (error) {
          return res.render({ locals: { title: 'Error', message: error.message } })
      }
  })

  viewsRouter.get('/login', isAuthorized, async (req, res) => {
      try {
          return res.render('loginViews/login', { locals: { title: 'Login'} })
      } catch (error) {
          return res.render( { title: 'Error', message: error.message } )
      }
  })

  viewsRouter.post('login', isAuthorized, async (req, res) => {
    try {
      return res.redirect('/profile')
    } catch (error) {
      return res.render( { title: 'Error', message: error.message } )
    }
  })

  viewsRouter.get('/profile', passportCall('jwt'), authorizationMiddleware('USER', 'ADMIN') , async (req, res) => {
    const user = req.user
    try {
      res.render('loginViews/profile', { locals: { title: 'Perfil', user: user } })
    } catch (error) {
        return res.render( { title: 'Error', message: error.message } )
    }
  })
  
  viewsRouter.get('/recoverypassword', isAuthorized, async (req, res) => {
      try {
          return res.render('loginViews/recoveryPassword', { locals: { title: 'Recuperar contraseña'} })
      } catch (error) {
          return res.render( { title: 'Error', message: error.message } )
      }
  })

  viewsRouter.get('/logout', async (req, res) => {
    try{
      res.clearCookie('authTokenCookie')
      res.redirect('/')

    } catch (error) {
      res.render( { title: 'Error', message: error.message } )
    }
  })

  //VISTAS DE PRODUCTOS
  viewsRouter.get('/home', passportCall('jwt'), authorizationMiddleware(['ADMIN', 'USER']), async (req, res) => {
    const user = req.user
    const admin = req.user.role === 'ADMIN'
    
    try{
        res.render('home', { title: 'Home', locals: { title: 'Vendemos Todo', user, admin } })
    } catch (error) {
        return res.render( { title: 'Error', message: error.message } )
      }
  })
  
  viewsRouter.get('/realTimeProducts', passportCall('jwt'), authorizationMiddleware('ADMIN'), async (req, res) => {
    handleProductsRoutes(req, res, 'productsViews/realTimeProducts')
  })

  viewsRouter.get('/products', passportCall('jwt'), authorizationMiddleware('USER'), async (req, res) => {
    handleProductsRoutes(req, res, 'productsViews/products')
  })

  //Visualizar detalle de producto
  viewsRouter.get('/products/:pid', passportCall('jwt'), authorizationMiddleware('USER'), async (req, res) => {
    const user = req.user
    const pid = req.params.pid
    try {
        const product = await productManager.getProductById(pid)

        return res.render('productsViews/productDetail', { locals: { title: 'Product Detail', product: product, user: user }})
    } catch (error) {
        return res.render( { title: 'Error', message: error.message } )
    }
  })
  //visualizar el carrito especifico donde deberan estar SOLO los productos que pertenezcan a dicho carrito
  viewsRouter.get('/carts/:cid', passportCall('jwt'), authorizationMiddleware('USER'), async (req, res) => {
    const user = req.user
    const cid = req.params.cid
    try {
      const cart = await cartManager.getCartById(cid)

      if(req.user.cart !== cid) {
        return res.render('error', { title: 'Error', message: 'No tenes permitado acceder a este carrito' })
      }

      const productsInCart = cart[0].products.map(p => p.toObject())
      const { totalQuantity, totalPrice } = productsInCart.reduce((acc, item) => {
        acc.totalQuantity += item.quantity;
        acc.totalPrice += item.quantity * item.product.price;

        return acc
      }, { totalQuantity: 0, totalPrice: 0 });

      if(cart[0].products.length === 0) {
        const noProducts = true
        return res.render('productsViews/cartDetail', { locals: { title: 'Cart Detail', noProducts, user } })
      } else {
        return res.render('productsViews/cartDetail', { locals: { title: 'Cart Detail', productsInCart, user, totalQuantity, totalPrice } })
      }
    } catch (error) {
      res.render('error', { title: 'Error', message: error.message })
    }
  })

  viewsRouter.get('/carts/:cid/purchase', passportCall('jwt'), authorizationMiddleware('USER'), async (req, res) => {
    const user = req.user
    const cid = req.params.cid
    try {
      const cart = await cartManager.getCartById(cid)

      if(req.user.cart != cid){
        return res.render('error', { title: 'Error', message: 'No tenes permitido acceder a este carrito' })
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

      return res.render('productsViews/checkout', { locals: { title: 'Checkout', productsInCart, user, totalQuantity, totalPrice } })

    } catch (error) {
      res.render('error', { title: 'Error', message: error.message })
    }
  })

  //VISTA DEL CHAT
  viewsRouter.get('/chat', passportCall('jwt'), authorizationMiddleware('USER'), async (req, res) => {
      try {
        res.render('chat', { locals: { title: 'Chat' } })
      } catch (error) {
          res.render('error', { locals: { title: 'Error', message: error.message } })
      }
  })

  return viewsRouter
}

module.exports = viewsRouterFn

