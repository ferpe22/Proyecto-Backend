const express = require('express')
const productsRouter = require('./routers/productsRouter')
const cartsRouter = require('./routers/cartsRouter')
const handlebars = require('express-handlebars')

const app = express()

app.engine('handlebars', handlebars.engine())
app.set('views', './src/views')
app.set('view engine', 'handlebars')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

app.use('/api/products', productsRouter)
app.use('/api/carts', cartsRouter)

app.get('/', (req, res) => {
    return res.json({
        status: 'running',
        date: new Date()
    })    
})

app.get('/home', (req, res) => {
    return res.render('home')
})

const PORT= 8080
app.listen (PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`)
})