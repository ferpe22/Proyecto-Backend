const { Router } = require('express')
const ProductManager = require('../managers/ProductManager')


const productsRouterFn = (io) => {
    const productsRouter = Router()
    const manager = new ProductManager('./src/products.json', io)

    productsRouter.get('/', async (req, res) => {
        try {
            const products = await manager.getProducts()
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
            const productId = parseInt(req.params.pid)
            const productFilteredById = await manager.getProductById(productId)
            
            if(!productFilteredById) {
                return res.status(404).send('El producto no existe')
            } else {
                return res.status(200).send(productFilteredById)
            }
        }
        catch (err) {
            console.log(err)
        }
    })
    
    productsRouter.post('/', async (req, res) => {
        try {
            const newProduct = req.body
            await manager.addProduct(newProduct)
        
            return res.status(201).json({ status: 'success', message: 'Producto agregado exitosamente' })
        }
        catch (error) {
            return res.status(500).json({ error: 'Error al agregar el producto', message: error.message })
        }
    })
    
    productsRouter.put('/:pid', async (req, res) => {
        try {
            const data = req.body
            const productId = parseInt(req.params.pid)
            const productFilteredById = await manager.getProductById(productId)
            
            if(!productFilteredById) {
                return res.status(404).json({
                    error: 'Product not found'
                })
            }
            await manager.updateProduct(productId, data)
            return res.status(200).json('El producto ha sido actualizado correctamente')
        }
        catch (err) {
            console.log(err)
        }
    })
    
    productsRouter.delete('/:pid', async (req, res) => {
        try {
            const productId = parseInt(req.params.pid)
            const productFilteredById = await manager.getProductById(productId)
            
            if(!productFilteredById) {
                return res.status(404).json({
                    error: 'Product not found'
                })
            }
                await manager.deleteProduct(productId)
                return res.status(204).json({})
    
        }
        catch (err) {
            console.log(err)
        }
    })

    return productsRouter
}



module.exports = productsRouterFn
