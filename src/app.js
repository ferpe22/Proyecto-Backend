const express = require('express')
const handlebars = require('express-handlebars')
const { Server } = require('socket.io')
const socketConnection = require('./utils/socketConnection')
require('dotenv').config()
// const moment = require('moment')
// require('moment/locale/es')
// moment.locale('es')
const MongoDb = require('./dao/MongoDB/MongoDB')
const cookieParser = require('cookie-parser')
const passport = require('passport')
const InitializePassport = require('./config/passport.config')
const flash = require('connect-flash')
const path = require('path')
const swaggerJsDocs = require('swagger-jsdoc')
const swaggerUiExpress = require('swagger-ui-express')
const errorMiddleware = require('./middlewares/errorMiddleware')
const addLogger = require('./utils/logger')


const app = express() //Creacion de aplicacion express

MongoDb.getConnection()

app.use(addLogger)

const swaggerOptions = {
  definitions: {
    openapi: '3.0.0',
    info: {
      title: 'Documentacion de VendemosTodo',
      description: 'API para la gestión de productos',
    },
    apis: [`${__dirname}/docs/**/*.yaml`],
  }
}

const specs = swaggerJsDocs(swaggerOptions)
app.use('/apidocs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs))

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
app.use(express.static(__dirname + '/public'))

app.use(flash())

//Passport
InitializePassport()
app.use(passport.initialize())



//Se levanta los servidores HTTP y SOCKET para que ambos esten corriendo en el mismo puerto. Sobre e sevidor http esta corriendo el servidor socket
const PORT= process.env.PORT
const httpServer = app.listen (PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`)) //servidor HTTP


const io = new Server(httpServer)
socketConnection(io)


//ROUTERS
const ProductsRouter = require('./routers/ProductsRouter')
const productsRouter = new ProductsRouter()
const CartsRouter = require('./routers/CartsRouter')
const cartsRouter = new CartsRouter()
const SessionRouter = require('./routers/SessionRouter')
const sessionRouter = new SessionRouter()
const ViewsRouter = require('./routers/ViewsRouter')
const viewsRouter = new ViewsRouter()


app.use('/api/products', productsRouter.getRouter());
app.use('/api/carts', cartsRouter.getRouter());
app.use('/api/users', sessionRouter.getRouter());
app.use('/', viewsRouter.getRouter());

app.use(errorMiddleware)


//ENDPOINTS
app.get('/healthcheck', (req, res) => {
    return res.json({
        status: 'running',
        date: new Date()
    })    
})

app.get('/loggerTest', (req, res) => {
  req.logger.debug('Test de desarrollo')

  req.logger.info('Test de produccion en consola')
  req.logger.console.error('Test de produccion de log en archivo')

  res.send({ message: 'Logger Test!' })
})
