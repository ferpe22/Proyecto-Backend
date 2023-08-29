const { Router } = require('express')
const ProductManager = require('../dao/DB/ProductManagerMongo')
const CartManager = require('../dao/DB/CartManagerMongo')
const UserManager = require('../dao/DB/UserManagerMongo')
//const ProductManager = require('../dao/FileSystem/ProductManager')

const viewsRouterFn = (io) => {
    const viewsRouter = Router()
    const productManager = new ProductManager(io)
    const cartManager = new CartManager(io)
    const userManager = new UserManager(io)

    viewsRouter.get('/register', async (req, res) => {
        return res.render('loginViews/register')
    })

    viewsRouter.get('/login', async (req, res) => {
        return res.render('loginViews/login')
    })

    viewsRouter.get('/home', async (req, res) => {
        const filters = {}
        const { page= 1, limit= 5, sort, category, availability } = req.query
        const sortOptions = sort === 'asc' ? { price: 1 } : sort === 'desc' ? { price: -1 } : {};
        const availabilityOptions = availability === 'available' ? true : availability === 'unavailable' ? false : undefined;
        const query = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: sortOptions,
        }
        
        try{
            if (category) {
                filters.category = category
            }

            if (availability) {
                filters.status = availabilityOptions;
            }
            
            const productsDB = await productManager.getAllProducts(filters, query)
            const products = productsDB.docs.map(p => p.toObject())
            
            if(products.length === 0) {
                return res.render('home', { title: 'Home', products: products, isEmpty: true })
            }

            return res.render('productsViews/home', { 
                title: 'Home', products: products, productsDB: productsDB, isEmpty: false,
                generatePaginationLink: (page) => {
                    const newQuery = { ...req.query, ...filters, page: page };
                    return '/home?' + new URLSearchParams(newQuery).toString();
                }
            })
        }
        catch (error) {
            return res.render( { title: 'Error', message: error.message } )
        }
    })
    
    viewsRouter.get('/realTimeProducts', async (req, res) => {
        const filters = {}
        const { page= 1, limit= 5, sort, category, availability } = req.query
        const sortOptions = sort === 'asc' ? { price: 1 } : sort === 'desc' ? { price: -1 } : {};
        const availabilityOptions = availability === 'available' ? true : availability === 'unavailable' ? false : undefined;
        const query = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: sortOptions,
        }
        
        try{
            if (category) {
                filters.category = category
            }

            if (availability) {
                filters.status = availabilityOptions;
            }
            
            const productsDB = await productManager.getAllProducts(filters, query)
            const products = productsDB.docs.map(p => p.toObject())
            
            if(products.length === 0) {
                return res.render('home', { title: 'Home', products: products, isEmpty: true })
            }

            return res.render('productsViews/realTimeProducts', { 
                title: 'Real Time Products', products: products, productsDB: productsDB, isEmpty: false,
                generatePaginationLink: (page) => {
                    const newQuery = { ...req.query, ...filters, page: page };
                    return '/realTimeProducts?' + new URLSearchParams(newQuery).toString();
                }
            })
        }
        catch (error) {
            return res.render( { title: 'Error', message: error.message } )
        }
    })


    //Visualizar todods los productos con su respectiva paginacion.
    viewsRouter.get('/products', async (req, res) => {
        const user = req.user
        console.log(user) 
        const filters = {}
        const { page= 1, limit= 5, sort, category, availability } = req.query
        const sortOptions = sort === 'asc' ? { price: 1 } : sort === 'desc' ? { price: -1 } : {};
        const availabilityOptions = availability === 'available' ? true : availability === 'unavailable' ? false : undefined;
        const query = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: sortOptions,
        }
        
        try{
            if (category) {
                filters.category = category
            }

            if (availability) {
                filters.status = availabilityOptions;
            }
            
            const productsDB = await productManager.getAllProducts(filters, query)
            const products = productsDB.docs.map(p => p.toObject())
            
            if(productsDB.docs.length === 0) {
                return res.render('products', { title: 'Products', user: user })
            }

            return res.render('productsViews/products', { 
                title: 'Products', products: products, productsDB: productsDB, user: user,
                generatePaginationLink: (page) => {
                    const newQuery = { ...req.query, ...filters, page: page };
                    return '/products?' + new URLSearchParams(newQuery).toString();
                }
            })
        }
        catch (error) {
            return res.render( { title: 'Error', message: error.message } )
        }
    })

    //Visualizar detalle de producto
    viewsRouter.get('/products/:pid', async (req, res) => {
        const pid = req.params.pid
        try {
            const product = await productManager.getProductById(pid)

            return res.render('productsViews/productDetail', { title: 'Product Detail', product: product })
        } catch (error) {
            return res.render( { title: 'Error', message: error.message } )
        }
    })
    //visualizar el carrito especifico donde deberan estar SOLO los productos que pertenezcan a dicho carrito
    viewsRouter.get('/carts/:cid', async (req, res) => {
        const cid = req.params.cid
        try {
            const cart = await cartManager.getCartById(cid)
            const productsInCart = cart[0].products.map(p => p.toObject())

            res.render('productsViews/carts', { title: 'Carts', productsInCart: productsInCart })

        } catch (error) {
            console.log(error)
        }
    })

    viewsRouter.get('/chat', (req, res) => {
        try {
            return res.render('chat', { title: 'Chat' })

        } catch (error) {
            console.log(error)
        }
    })

    return viewsRouter
}

module.exports = viewsRouterFn

