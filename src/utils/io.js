const { Server } = require('socket.io') //se desestructura el socket.io y se solicita el modulo Server.

const init = (httpServer) => {
    const io = new Server(httpServer) //servidor SOCKET

    io.on('connection', (socket) => {
        console.log('Nuevo cliente conectado!', socket.id)

        socket.on('mi_mensaje', (data) => {
            console.log(data)
        })

        setTimeout(() => {
            socket.emit('mensaje_backend', 'Mensaje enviado desde el backend')        
        }, 2000)

        socket.on('EnviarNewProduct', (data) => {
            console.log(data)
        })

        socket.on('borrarProducto', (id) => {
            console.log(id, 'borrar producto')
        })

    return io

})
}


module.exports = init