const express = require('express') //Requiero express
const productsRouter = require('./routers/productsRouter') //Requiero el router de productos
const cartsRouter = require('./routers/cartsRouter') //Requiero el router de carritos
const viewsRouter = require('./routers/viewsRouter')
const handlebars = require('express-handlebars') //Requiero handlebars, el motor de plantillas
const socketServer = require('./utils/io')

const app = express() //Creacion de aplicacion express

//Configuraicon de handlebars
app.engine('handlebars', handlebars.engine()) //inicializar el motor
app.set('views', './src/views') //ubicacion de  las vistas
app.set('view engine', 'handlebars') //indicamos que el motor

//Middlewares para manejar JSON y forms
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
//Middlewares de estaticos (configuracion la carpeta pubic de forma estatica)
app.use(express.static(__dirname+ '/public'))

//Se levanta los servidores HTTP y SOCKET para que ambos esten corriendo en el mismo puerto. Sobre e sevidor http esta corriendo el servidor socket
const PORT= 8080
const httpServer = app.listen (PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`)) //servidor HTTP

const io = socketServer(httpServer)

//ruta base de los routers
app.use('/api/products', productsRouter)
app.use('/api/carts', cartsRouter)
app.use('/', viewsRouter)

//ENDPOINTS
app.get('/healthcheck', (req, res) => {
    return res.json({
        status: 'running',
        date: new Date()
    })    
})

