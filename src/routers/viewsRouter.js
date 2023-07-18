const { Router } = require('express')
const viewsRouter = Router()
const ProductManager = require('../managers/ProductManager')
const manager = new ProductManager('./src/products.json')
const { Server }= require('socket.io')

viewsRouter.get('/home', async (req, res) => {
    try{
        const products = await manager.getProducts()
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
        const products = await manager.getProducts()
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
    
})

module.exports = viewsRouter

