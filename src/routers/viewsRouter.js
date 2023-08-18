const { Router } = require('express')
const ProductManager = require('../dao/DB/ProductManagerMongo')
const CartManager = require('../dao/DB/CartManagerMongo')
//const ProductManager = require('../dao/FileSystem/ProductManager')

const viewsRouterFn = (io) => {
    const viewsRouter = Router()
    const productManager = new ProductManager(io)
    const cartManager = new CartManager(io)

    viewsRouter.get('/home', async (req, res) => {
        try{
            const products = await productManager.getAllProducts()
            const limit = req.query.limit
            
            if(products.length === 0) {
                return res.send('No hay productos en la base de datos')
            }
            if(!limit) {
                return res.render('home', { title: 'Home', products: products, isEmpty: false })
            }

            const limitedProd = products.slice(0, parseInt(limit))
            return res.render('home', { title: 'Home', products: limitedProd } )
        }
        catch (error) {
            return res.send( { error: 'Error a cargar los productos' } )
        }
    })
    
    viewsRouter.get('/realTimeProducts', async (req, res) => {
        try{
            const products = await productManager.getAllProducts()
            const limit = req.query.limit
            
            if(products.length === 0) {
                return res.send('No hay productos en la base de datos')
            }
            if(!limit) {
                return res.render('realTimeProducts', { title: 'Real Time Products', products: products })
            }

            const limitedProd = products.slice(0, parseInt(limit))
            return res.render('realTimeProducts', { title: 'Real Time Products', products: limitedProd } )
        }
        catch (error) {
            return res.send( { error: 'Error a cargar los productos' } )
        }
    })

    /*viewsRouter.post('/realTimeProducts', async (req, res) => {
        try {
            const body = req.body
            await productManager.addProduct(body)

            io.emit('newProduct', JSON.stringify(nvoProd))
        }
        catch(error) {
            return res.send( { error: 'Error al guardar el producto' } )
        }
        
        return res.render.status(201).json(newProduct)
    })*/

    //Visualizar todods los productos con su respectiva paginacion.
    viewsRouter.get('/products', async (req, res) => {
        try{
            const products = await productManager.getAllProducts()
            const limit = req.query.limit
            
            if(products.length === 0) {
                return res.send('No hay productos en la base de datos')
            }
            if(!limit) {
                return res.render('products', { title: 'Products', products: products, isEmpty: false })
            }

            const limitedProd = products.slice(0, parseInt(limit))
            return res.render('products', { title: 'Products', products: limitedProd } )
        }
        catch (error) {
            return res.send( { error: 'Error a cargar los productos' } )
        }
    })

    //Visualizar detalle de producto
    viewsRouter.get('/products/:pid', async (req, res) => {
        
    })
    //visualizar el carrito especifico donde deberan estar SOLO los productos que pertenezcan a dicho carrito
    viewsRouter.get('/carts/:cid', async (req, res) => {
        const cid = req.params.cid
        try {
            const cart = await cartManager.getCartById(cid)
            console.log(cart)
            const productsInCart = cart[0].products.map(p => p.toObject())
            res.render('carts', { title: 'Carts', productsInCart })

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

