const express = require('express') //Requiero express
const productsRouterFn = require('./routers/productsRouter') //Requiero el router de productos
const cartsRouterFn = require('./routers/cartsRouter') //Requiero el router de carritos
const viewsRouterFn = require('./routers/viewsRouter')
const handlebars = require('express-handlebars') //Requiero handlebars, el motor de plantillas
const socketServer = require('./utils/io')
//const ProductManager = require('./dao/FileSystem/ProductManager')
const mongoose = require('mongoose')
const ProductManager = require('./dao/DB/ProductManagerMongo')
const MessageManager = require('./dao/DB/MessageManagerMongo')
require('dotenv').config()
const mongoDbPwd = process.env.MONGODB_PWD
const moment = require('moment')
require('moment/locale/es')
moment.locale('es')


const app = express() //Creacion de aplicacion express


//Configuraicon de handlebars
app.engine('handlebars', handlebars.engine()) //inicializar el motor
app.set('views', './src/views') //ubicacion de  las vistas
app.set('view engine', 'handlebars') //indicamos que el motor

//Configuarion de Mongoose
const MONGODB_CONNECT = `mongodb+srv://ferpereira22:${mongoDbPwd}@cluster0.vkepnh1.mongodb.net/ecommerce?retryWrites=true&w=majority`
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

const productManager = new ProductManager(io)
const messageManager = new MessageManager(io)

//SOCKETS
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado!', socket.id)

    //Recibo del front la info del nuevo producto, lo agregao a DB Mongo y emito la info de este al front nuevamente
    socket.on('AddProduct', async (data) => {
        console.log(data)
        const newProduct = JSON.parse(data)
        console.log(newProduct)
        try {
            await productManager.addProduct(newProduct)
            io.emit('newProductToAdd', JSON.stringify(newProduct))
        }
        catch(error) {
            io.emit('notification', 'Error al guardar el producto')
        }
    })
    
    socket.on('deleteProduct', async (id) => {
        try{
            const products = await productManager.getProducts()
        }
        catch (error) {
            return res.send( { error: 'Error al borrar el producto' } )
        }
    })

    //Recibe el info del user que se union al chat y avisa al resto que se ha unido. Tambien recopila mensajes previos y los envio al front
    socket.on('joinToChat', async (newUser) => {
        try {
            socket.broadcast.emit('notification', `Nuevo usuario conectado al chat: ${newUser}`)
            
            const messages = await messageManager.getAllMessages()

            const formatedMessages = messages.map((message) => ({
                ...message,
                formatedTimestamp: moment(message.timestamp).format('MMMM Do YYYY, h:mm:ss a'),
            }))

            socket.emit('messageLogs', formatedMessages)

        } catch (error) {
            socket.emit('notification', error.message)
        }

    })

    //Recibe el mensaje del front, lo agrega a la DB Mongo y emite notificacion de nuevo mensaje. Tambien emite a info del mensaje para que el front lo muestre en pantalla
    socket.on('newMessage', async ({ user, message }) => {
        try {
            const newMessage = await messageManager.addMessage(user, message) 
            socket.broadcast.emit('notification', `Nuevo mensaje de ${user}`)

            io.emit('printNewMessage', {
                user: newMessage.user,
                content: newMessage.content,
                timestamp: moment(newMessage.timestamp).format('MMMM Do YYYY, h:mm:ss a')
            })

        } catch (error) {
            socket.emit('notification', error.message)
        }
    })

})


//ruta base de los routers
const productsRouter = productsRouterFn(io)
app.use('/api/products', productsRouter)
const cartsRouter = cartsRouterFn(io)
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

