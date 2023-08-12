const express = require('express') //Requiero express
const productsRouterFn = require('./routers/productsRouter') //Requiero el router de productos
const cartsRouter = require('./routers/cartsRouter') //Requiero el router de carritos
const viewsRouterFn = require('./routers/viewsRouter')
const handlebars = require('express-handlebars') //Requiero handlebars, el motor de plantillas
const socketServer = require('./utils/io')
//const ProductManager = require('./dao/FileSystem/ProductManager')
const ProductManager = require('./dao/DB/ProductManagerMongo')
const mongoose = require('mongoose')

const app = express() //Creacion de aplicacion express


//Configuraicon de handlebars
app.engine('handlebars', handlebars.engine()) //inicializar el motor
app.set('views', './src/views') //ubicacion de  las vistas
app.set('view engine', 'handlebars') //indicamos que el motor

//Configuarion de Mongoose
const MONGODB_CONNECT = 'mongodb+srv://ferpereira22:franco15@cluster0.vkepnh1.mongodb.net/ecommerce?retryWrites=true&w=majority'
mongoose.connect(MONGODB_CONNECT)
.then(() => console.log('Conectado a MongoDB'))
.catch((error) => console.log(error))


//Middlewares para manejar JSON y forms
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


//Middlewares de estaticos (configuracion la carpeta pubic de forma estatica)
app.use(express.static(__dirname+ '/public'))


//Se levanta los servidores HTTP y SOCKET para que ambos esten corriendo en el mismo puerto. Sobre e sevidor http esta corriendo el servidor socket
const PORT= 8080
const httpServer = app.listen (PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`)) //servidor HTTP


const io = socketServer(httpServer)
//const manager = new ProductManager('./src/products.json', io)

//SOCKETS
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado!', socket.id)

    socket.on('AddProduct', async (data) => {
        console.log(data)
        const newProduct = JSON.parse(data)
        console.log(newProduct)
        try {
            await manager.addProduct(newProduct)
            io.emit('nuevoProducto', JSON.stringify(newProduct))
        }
        catch(error) {
            io.emit('notification', 'Error al guardar el producto')
        }
    })
    
    socket.on('deleteProduct', async (id) => {
        try{
            const products = await manager.getProducts()
        }
        catch (error) {
            return res.send( { error: 'Error al borrar el producto' } )
        }
    })
})


//ruta base de los routers
const productsRouter = productsRouterFn(io)
app.use('/api/products', productsRouter)
app.use('/api/carts', cartsRouter)
const viewsRouter = viewsRouterFn(io)
app.use('/', viewsRouter)


//ENDPOINTS
app.get('/healthcheck', (req, res) => {
    return res.json({
        status: 'running',
        date: new Date()
    })    
})

