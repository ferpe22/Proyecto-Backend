const { Router } = require('express')
const cartsRouter = Router()
const CartManager = require('../dao/DB/CartManagerMongo')
//const cartManager = new CartManager('./src/carts.json')
const cartManager = new CartManager()

cartsRouter.get('/', async (req, res) => {
    try {
        const carts = await cartManager.getAllCarts()
        // if(carts.lenght === 0) {
        //     return res.status(404).send('No hay carritos para mostrar')
        // }
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

cartsRouter.post('/:cid/product/:pid', async (req, res) => {
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

module.exports = cartsRouter