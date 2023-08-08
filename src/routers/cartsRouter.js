const { Router } = require('express')
const cartsRouter = Router()


const CartManager = require('../dao/FileSystem/CartManager')
const managerCart = new CartManager('./src/carts.json')

cartsRouter.get('/', async (req, res) => {
    try {
        const carts = await managerCart.getCarts()
        return res.send(carts)
    }
    catch (err) {
        console.log(err)
    }
})

cartsRouter.post('/', async (req, res) => {
    try {
        const cart = req.body
        await managerCart.addCart(cart)

        return res.status(201).json({ status: 'success', message: 'Carrito agregado exitosamente' })
        
    }
    catch (error) {
        return res.status(500).json({ error: 'Error al agregar el carrito', message: error.message })
    }
})

cartsRouter.get('/:cid', async (req, res) => {
    try {
        const cartId = parseInt(req.params.cid)
        const cartFilteredById = await managerCart.getCartById(cartId)

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

        const cartFilteredById = await managerCart.getCartById(cartId)

        if(!cartFilteredById) {
            res.status(404).send('El carrito no existe')
        }
        
        const productFilteredById = await managerCart.getCartById(prodId)
        
        if(!productFilteredById) {
            return res.status(404).send('El producto no existe')
        }
        const prodEnCart = cartFilteredById.products.find( e => e.product === prodId)

        if(!prodEnCart){
            const newProductoInCart = {
                product: prodId,
                quantity: 1
            }
            cartFilteredById.products.push(newProductoInCart)
        } else {
            prodEnCart.quantity++
        }
        
        // const prod = {
        //     id: prod.id 
        // }
        // cart.product.push(prod)

        await managerCart.updateCart(cartId, cartFilteredById)

        return res.status(201).json(cartFilteredById)
    }
    catch (err) {
        console.log(err)
    }
})

module.exports = cartsRouter