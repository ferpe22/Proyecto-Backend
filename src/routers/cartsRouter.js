const { Router } = require('express')
const CartManager = require('../dao/DB/CartManagerMongo')
//const cartManager = new CartManager('./src/carts.json')


const cartsRouterFn = (io) => {
    const cartsRouter = Router()
    const cartManager = new CartManager(io)

    cartsRouter.get('/', async (req, res) => {
        try {
            const carts = await cartManager.getAllCarts()

            return res.status(200).json({ status: 'success', payload: carts})
        }
        catch (error) {
            return res.status(500).json({ error: 'Error al obtener los carritos', message: error.message })
        }
    })
    
    cartsRouter.get('/:cid', async (req, res) => {
        const cid = req.params.cid
        try {
            const cart = await cartManager.getCartById(cid)
            return res.status(200).json({ status: 'success', payload: cart})
        }
        catch (error) {
            return res.status(500).json({ error: 'Error al obtener los carritos', message: error.message })
        }
    })
    
    cartsRouter.post('/', async (req, res) => {
        try {
            await cartManager.addCart()
    
            return res.status(201).json({ status: 'success', message: 'Carrito agregado exitosamente' })
        }
        catch (error) {
            return res.status(500).json({ error: 'Error al agregar el carrito', message: error.message })
        }
    })
    
    cartsRouter.post('/:cid/products/:pid', async (req, res) => {
        const cid = req.params.cid
        const pid = req.params.pid
        
        try {
            await cartManager.addProductToCart(cid, pid)
    
            return res.status(201).json({ status: 'success', message: 'Producto agregado al carrito exitosamente' })
        }
        catch (error) {
            if (error.message === 'El producto no se encuentra en el inventario') {
                return res.status(404).json({ error: 'Product Not Found', message: 'El producto que intentas agregar no se encuentra en inventario' })
            }
    
            if (error.message === 'No se encuentra el carrito') {
                return res.status(404).json({ error: 'Cart Not Found', message: 'No se pueda ingresar productos a un carrito inexistente' })
            }
    
            return res.status(500).json({ error: 'Error al guardar el producto en el carrito', message: error.message })
        }
    })

    //NUEVOS ENDPOINTS

    //eliminar del carrito, el productos seleccionado
    cartsRouter.delete('/:cid/products/:pid', async (req, res) => {
        const cid = req.params.cid
        const pid = req.params.pid
        
        try {
            await cartManager.deleteProductInCart(cid, pid)
    
            return res.status(201).json({ status: 'success', message: 'Producto ha sido borrado del carrito exitosamente' })
        }
        catch (error) {
            if (error.message === 'El producto no existe en nuestro inventario') {
                return res.status(404).json({ error: 'Product Not Found in stock', message: 'El producto que intentas borrar no se encuentra en buestro inventario' })
            }
    
            if (error.message === 'No se encuentra el carrito') {
                return res.status(404).json({ error: 'Cart Not Found', message: 'No se pueda borrar productos de un carrito inexistente' })
            }

            if (error.message === 'El producto no se encuentra en el carrito') {
                return res.status(404).json({ error: 'Product Not Found', message: 'El producto que intentas borrar no se encuentra en el carrito' })
            }
    
            return res.status(500).json({ error: 'Error al borrar el producto del carrito', message: error.message })
        }
    })
    
    //actualizar el carrito con un arreglo de productos con el formato especificado arriba
    cartsRouter.put('/:cid', async (req, res) => {
        const cid = req.params.cid
        const newProducts = req.body.product
        console.log(newProducts)
        
        try {
            await cartManager.UpdateArrayProductsInCart(cid, newProducts)
    
            return res.status(201).json({ status: 'success', message: 'Los productos han sido actualizados exitosamente' })
        }
        catch (error) {
            if (error.message === 'No se encuentra el carrito') {
                return res.status(404).json({ error: 'Cart Not Found', message: 'No se pueda ingresar productos a un carrito inexistente' })
            }
            
            if (error.message === 'El producto no se encuentra en el inventario') {
                return res.status(404).json({ error: 'Product Not Found', message: 'El producto que intentas agregar no se encuentra en inventario' })
            }

            if (error.message === 'No hay productos en inventario') {
                return res.status(404).json({ error: 'Inventory Whitout Products', message: 'No hay productos en inventario' })
            }

            return res.status(500).json({ error: 'Error al guardar los productos en el carrito', message: error.message })
        }
    })

    //actualizar SOLO la cantidad de ejemplares del producto por cualquier cantidad pasada desde el req.body
    cartsRouter.put('/:cid/products/:pid', async (req, res) => {
        const cid = req.params.cid
        const pid = req.params.pid
        const quantity = req.body.quantity
        
        try {
            await cartManager.UpdateQtyProductInCart(cid, pid, quantity)
    
            return res.status(201).json({ status: 'success', message: 'La cantidad del producto seleccionado ha sido actualizada exitosamente' })
        }
        catch (error) {
            if (error.message === 'El producto no se encuentra en el inventario') {
                return res.status(404).json({ error: 'Product Not Found', message: 'El producto que intentas agregar no se encuentra en inventario' })
            }
    
            if (error.message === 'No se encuentra el carrito') {
                return res.status(404).json({ error: 'Cart Not Found', message: 'No se pueda ingresar productos a un carrito inexistente' })
            }

            if (error.message === 'El producto no se encuentra en el carrito') {
                return res.status(404).json({ error: 'Product Not Found', message: 'El producto que intentas borrar no se encuentra en el carrito' })
            }
    
            return res.status(500).json({ error: 'Error al guardar el producto en el carrito', message: error.message })
        }
    })

    //eliminar todos los productos del carrito
    cartsRouter.delete('/:cid', async (req, res) => {
        const cid = req.params.cid

        try {
            await cartManager.deleteAllProductsInCart(cid)
    
            return res.status(201).json({ status: 'success', message: 'Los productos han sido borrados del carrito exitosamente' })
        }
        catch (error) {
            if (error.message === 'No se encuentra el carrito') {
                return res.status(404).json({ error: 'Cart Not Found', message: 'No se pueda borrar productos de un carrito inexistente' })
            }

            if (error.message === 'El carrito esta vacio') {
                return res.status(404).json({ error: 'Cart is empty', message: 'El carrito elegido esta vacio' })
            }
    
            return res.status(500).json({ error: 'Error al borrar los productos del carrito', message: error.message })
        }
    })

    return cartsRouter
}

module.exports = cartsRouterFn