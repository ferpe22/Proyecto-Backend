const { Router } = require('express')
const ProductManager = require('../dao/DB/ProductManagerMongo')
//const ProductManager = require('../dao/FileSystem/ProductManager')


const productsRouterFn = (io) => {
    const productsRouter = Router()
    const productManager = new ProductManager(io)

    productsRouter.get('/', async (req, res) => {
        const filters = {}
        const { page= 1, limit= 5, sort, category, availability } = req.query
        const sortOptions = sort === 'asc' ? { price: 1 } : sort === 'desc' ? { price: -1 } : {};
        const availabilityOptions = availability === 'available' ? true : availability === 'unavailable' ? false : undefined;
        const query = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: sortOptions,
        }
        
        try {
            if (category) {
                filters.category = category
            }

            if (availability) {
                filters.status = availabilityOptions;
            }
            
            const products = await productManager.getAllProducts(filters, query)

            const generatePageLink = (page) => {
                const newQuery = { ...req.query, ...filters, page: page };
                //return `api/products?${new URLSearchParams(newQuery).toString()}`
                return 'api/products?' + new URLSearchParams(newQuery).toString();
            };
            
            return res.status(200).json({
                status: 'success',
                payload: products.doc,
                totalPages: products.totalPages,
                prevPage: products.prevPage,
                nextPage: products.nextPage,
                hasPrevPage: products.hasPrevPage,
                hasNextPage: products.hasNextPage,
                prevLink: products.hasPrevPage ? generatePageLink(products.prevPage) : null,
                nextLink: products.hasNextPage ? generatePageLink(products.nextPage) : null
            })

        }
        catch (error) {
            if (error.message === 'No hay productos en el inventario') {
                return res.status(404).json({ status: 'error', message: error.message })
            }

            return res.status(500).json({ status: 'error', error: 'Error al obtener los productos', message: error.message })
        }   
    })
    
    productsRouter.get('/:pid', async (req, res) => {
        try {
            const pid = req.params.pid
            const productFilteredById = await productManager.getProductById(pid)
            
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
            await productManager.addProduct(body)
        
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
            const product = await productManager.updateProduct(pid, body)
            
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
            
            const product = await productManager.deleteProduct(pid)
            
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
