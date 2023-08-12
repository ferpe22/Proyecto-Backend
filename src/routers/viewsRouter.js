const { Router } = require('express')
const ProductManager = require('../dao/DB/ProductManagerMongo')
//const ProductManager = require('../dao/FileSystem/ProductManager')

const viewsRouterFn = (io) => {
    const viewsRouter = Router()
    const manager = new ProductManager(io)

    viewsRouter.get('/home', async (req, res) => {
        try{
            const products = await manager.getAllProducts()
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
            const products = await manager.getAllProducts()
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

    viewsRouter.post('/realTimeProducts', async (req, res) => {
        try {
            const body = req.body
            await manager.addProduct(body)

            io.emit('newProduct', JSON.stringify(nvoProd))
        }
        catch(error) {
            return res.send( { error: 'Error al guardar el producto' } )
        }
        
        return res.render.status(201).json(newProduct)
    })

    return viewsRouter
}

module.exports = viewsRouterFn

