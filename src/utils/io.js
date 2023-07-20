const { Server } = require('socket.io') //se desestructura el socket.io y se solicita el modulo Server.

const init = (httpServer) => {
    const io = new Server(httpServer) //servidor SOCKET
    
    return io
}

module.exports = init