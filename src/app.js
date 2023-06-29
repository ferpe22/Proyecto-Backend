const express = require('express')
const app = express()

const ProductManager = require('./ProductManager')
const manager = new ProductManager('./src/products.json')

app.get('/products', async (req, res) => {
    try {
        const products = await manager.getProducts(req.query.limit)

        if(!req.query.limit) {
            return res.send(products)
        } else {
            const limitedProd = products.slice(0, req.query.limit)
            return res.send(limitedProd)
        }
    }
    catch (err) {
        console.log(err)
    }   
})

app.get('/products/:pid', async (req, res) => {
    try {
        const productId = parseInt(req.params.pid)
        const productFilteredById = await manager.getProductById(productId)
        
        if(!productFilteredById) {
            return res.send('El producto no existe')
        } else {
            return res.send(productFilteredById)
        }
    }
    catch (err) {
        console.log(err)
    }
})

app.listen (8080, () => {
    console.log('Escuchando el pto 8080')
})