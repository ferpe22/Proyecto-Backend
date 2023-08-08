const { Router } = require('express')
const ProductManager = require('../dao/DB/ProductManagerMongo')


const productsRouterFn = (io) => {
    const productsRouter = Router()
    const manager = new ProductManager('./src/products.json', io)

    productsRouter.get('/', async (req, res) => {
        try {
            const products = await manager.getAllProducts()
            const limit = req.query.limit
    
            if(!limit) {
                return res.status(200).send(products)
            } else {
                const limitedProd = products.slice(0, limit)
                return res.status(200).send(limitedProd)
            }
        }
        catch (err) {
            console.log(err)
        }   
    })
    
    productsRouter.get('/:pid', async (req, res) => {
        try {
            const pid = req.params.pid
            const productFilteredById = await manager.getProductById(pid)
            
            if(!productFilteredById) {
                return res.status(404).send('El producto no existe')
            } else {
                return res.status(200).json(productFilteredById)
            }
        }
        catch (err) {
            console.log(err)
        }
    })
    
    productsRouter.post('/', async (req, res) => {
        try {
            const body = req.body
            await manager.addProduct(body)
        
            return res.status(201).json({ status: 'success', message: 'Producto agregado exitosamente' })
        }
        catch (error) {
            return res.status(500).json({ error: 'Error al agregar el producto', message: error.message })
        }
    })
    
    productsRouter.put('/:pid', async (req, res) => {
        try {
            const body = req.body
            const pid = req.params.pid
            const product = await manager.updateProduct(pid, body)
            
            // if(!product) {
            //     return res.status(404).json({
            //         error: 'Product not found'
            //     })
            // }
            return res.status(200).json( { status: 'success', message: 'El producto ha sido actualizado correctamente', product } )
        }
        catch (err) {
            console.log(err)
        }
    })
    
    productsRouter.delete('/:pid', async (req, res) => {
        const pid = req.params.pid
        try {
            // if(!productFilteredById) {
            //     return res.status(404).json({
            //         error: 'Product not found'
            //     })
            // }
            
            const product = await manager.deleteProduct(pid)
            
            return res.status(200).json({ status: 'success', message: 'El producto ha sido borrado correctamente', product })
    
        }
        catch (e) {
            return res.status(404).json({
                message: e.message
                })
        }
    })

    return productsRouter
}



module.exports = productsRouterFn
