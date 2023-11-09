// const { Server } = require('socket.io') //se desestructura el socket.io y se solicita el modulo Server.

// const init = (httpServer) => {
//     const io = new Server(httpServer) //servidor SOCKET
    
//     return io
// }

// module.exports = init

const moment  = require('moment')
const MessageManager = require('../dao/MongoDB/managers/MessageManagerMongo')

const socketConnection = (io) => {
  const messageManager = new MessageManager()

  io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado!', socket.id)
  
    //Recibo del front la info del nuevo producto, lo agregao a DB Mongo y emito la info de este al front nuevamente
    socket.on('addProduct', async (data) => {
      const newProduct = JSON.parse(data)

      try {
        await productManager.addProduct(newProduct)
        //socket.emit('newProductToAdd', { message: 'Producto actualizado exitosamente', payload: JSON.stringify(newProduct), type: 'success' })
        socket.emit('notification', { message: 'Producto actualizado exitosamente', type: 'success' })
      } catch(error) {
        socket.emit('notification', { message: error.message, type: 'error' })
      }
    })
  
    socket.on('updateProduct', async (productId, data) => {
      try {
        await productManager.updateProduct(productId, data)
        socket.emit('notification', { message: 'Producto actualizado exitosamente', type: 'success' })
      } catch (error) {
        socket.emit('notification', { message: error.message, type: 'error' })
      }
    })
    
    socket.on('deleteProduct', async (productId) => {
      try{
        await productManager.deleteProduct(productId)
        socket.emit('notification', { message: 'Producto eliminado exitosamente', type: 'success' })
      } catch (error) {
        socket.emit('notification', { message: error.message, type: 'error' })
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
        socket.emit('notification', { message: error.message, type: 'error' })
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
}

module.exports = socketConnection