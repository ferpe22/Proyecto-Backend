const express = require('express') //Requiero express
const productsRouterFn = require('./routers/productsRouter') //Requiero el router de productos
const cartsRouterFn = require('./routers/cartsRouter') //Requiero el router de carritos
const viewsRouterFn = require('./routers/viewsRouter')
const sessionRouterFn = require('./routers/sessionRouter')
const handlebars = require('express-handlebars') //Requiero handlebars, el motor de plantillas
const socketServer = require('./utils/io')
//const ProductManager = require('./dao/FileSystem/ProductManager')
//const mongoose = require('mongoose')
const ProductManager = require('./dao/MongoDB/managers/ProductManagerMongo')
const MessageManager = require('./dao/MongoDB/managers/MessageManagerMongo')
const CartManager = require('./dao/MongoDB/managers/CartManagerMongo')
require('dotenv').config()
//const mongoDbPwd = process.env.MONGODB_PWD
const moment = require('moment')
require('moment/locale/es')
moment.locale('es')
const MongoDb = require('./dao/MongoDB/MongoDB')
//const MongoStore = require('connect-mongo')

const cookieParser = require('cookie-parser')
const session = require('express-session')
const passport = require('passport')
const InitializePassport = require('./config/passport.config')
const flash = require('connect-flash')
const setting = require('./commands/command')
const path = require('path')


const app = express() //Creacion de aplicacion express

MongoDb.getConnection()

//Configuraicon de handlebars
app.engine('handlebars', handlebars.engine()) //inicializar el motor
app.set('views', path.join(__dirname, 'views')) //ubicacion de  las vistas
app.set('view engine', 'handlebars') //indicamos que el motor

//Configuarion de Mongoose
// const MONGODB_CONNECT = `mongodb+srv://ferpereira22:${mongoDbPwd}@cluster0.vkepnh1.mongodb.net/ecommerce?retryWrites=true&w=majority`
// mongoose.connect(MONGODB_CONNECT)
// .then(() => console.log('Conectado a MongoDB'))
// .catch((error) => console.log(error))



//Middlewares para manejar JSON y forms
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//Middleware para gestionar las cookies
app.use(cookieParser())
//app.use(cookieParser('secretkey'))

//Middlewares de estaticos (configuracion la carpeta pubic de forma estatica)
app.use(express.static(__dirname+ '/public'))

app.use(flash())

//Passport
InitializePassport()
app.use(passport.initialize())
//app.use(passport.session())


//Se levanta los servidores HTTP y SOCKET para que ambos esten corriendo en el mismo puerto. Sobre e sevidor http esta corriendo el servidor socket
const PORT= process.env.PORT
const httpServer = app.listen (PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`)) //servidor HTTP


const io = socketServer(httpServer)


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
      io.emit('newProductToAdd', { message: 'Producto actualizado exitosamente', payload: JSON.stringify(newProduct), type: 'success' })
    } catch(error) {
      io.emit('notification', { message: 'Error al guardar el producto', type: 'error' })
    }
  })

  socket.on('updateProduct', async (productId, data) => {
    try {
      await productManager.updateProduct(productId, data)
      io.emit('notification', { message: 'Producto actualizado exitosamente', type: 'success' })
    } catch (error) {
      io.emit('notification', { message: 'Error al actualizar el producto', type: 'error' })
    }
  })
  
  socket.on('deleteProduct', async (productId) => {
    try{
      await productManager.deleteProduct(productId)
      io.emit('notification', { message: 'Producto eliminado exitosamente', type: 'success' })
    } catch (error) {
      io.emit('notification', { message: 'Error al eliminar el producto', type: 'error' })
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
      socket.emit('notification', { message: error.message, type: 'error' })
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

  socket.on('addProductToCart', async ({ cid, pid }) => {
    try {
      await cartManager.addProductToCart(cid, pid)
      socket.emit('notification', { message: 'Producto agregado al carrito' })
    } catch (error) {
      socket.emit('notification', { message: error.message })
    }
  })
})

const productManager = new ProductManager(io)
const messageManager = new MessageManager(io)
const cartManager = new CartManager(io)


//Ruta base de los routers
const productsRouter = productsRouterFn(io)
app.use('/api/products', productsRouter)
const cartsRouter = cartsRouterFn(io)
app.use('/api/carts', cartsRouter)
const sessionRouter = sessionRouterFn(io)
app.use('/api/sessions', sessionRouter)
const viewsRouter = viewsRouterFn(io)
app.use('/', viewsRouter)


//ENDPOINTS
app.get('/healthcheck', (req, res) => {
    return res.json({
        status: 'running',
        date: new Date()
    })    
})