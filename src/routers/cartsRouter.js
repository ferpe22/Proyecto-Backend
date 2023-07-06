const { Router } = require('express')
const cartsRouter = Router()

const CartManager = require('../CartManager')
const manager = new CartManager('./src/carts.json')

cartsRouter.get('/', async (req, res) => {
    try {
        const carts = await manager.getCarts()
        return res.send(carts)
    }
    catch (err) {
        console.log(err)
    }
})

cartsRouter.post('/', async (req, res) => {
    try {
        const cart = req.body
        await manager.addCart(cart)

        return res.status(201).json(cart)
    }
    catch (err) {
        console.log(err)
    }
})

cartsRouter.get('/:cid', async (req, res) => {
    try {
        const cartId = parseInt(req.params.cid)
        const cartFilteredById = await manager.getCartById(cartId)

        if(!cartFilteredById) {
            res.status(404).send('El carrito no existe')
        }
        return res.status(201).json(cartFilteredById)

    }
    catch (err) {
        console.log(err)
    }
})

cartsRouter.post('/:cid/product/:pid', async (req, res) => {
    try {
        const cartId = parseInt(req.params.cid)
        const prodId = parseInt(req.params.pid)

        const cartFilteredById = await manager.getCartById(cartId)

        if(!cartFilteredById) {
            res.status(404).send('El carrito no existe')
        }
        const product = {
            id: product.id
        }
        cart.product.push(product)
        
        return res.status(201).json(cartFilteredById)
    }
    catch (err) {
        console.log(err)
    }
})

module.exports = cartsRouter