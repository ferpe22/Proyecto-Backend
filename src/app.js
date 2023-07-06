const express = require('express')
const productsRouter = require('./routers/productsRouter')
const cartsRouter = require('./routers/cartsRouter')


const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/products', productsRouter)
app.use('/api/carts', cartsRouter)


app.listen (8080, () => {
    console.log('Escuchando el pto 8080')
})