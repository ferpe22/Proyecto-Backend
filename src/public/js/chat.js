const socket = io()

let user
let chatBox = document.getElementById('chatbox')
let messageLogs = document.getElementById('messageLogs')

//Identificacion para ingresar el User Name. Tambien emite el mensaje de un nuevo usuario que se une al chat
const identificacion = async () => {
    try {
        const result = await Swal.fire({
            title: "Bienvenido al chat! Por favor identificarse",
            input: 'text',
            text: "Ingrese su usuario",
            inputValidator: (value) => {
                if (!value) {
                    return 'Por favor ingrese su usuario'
                }
            },
            allowOutsideClick: false,
        });

        user = result.value

        socket.emit('joinToChat', user)

    } catch (error) {
        console.log(error)
    }   
}

identificacion()

//Toma la info del chatBox (el contenido del mensaje en si) y emite el mensaje al backend
chatBox.addEventListener('keyup', evt => {
    if(evt.key === "Enter" && chatBox.value.trim(0).length > 0 && user){
            socket.emit('newMessage', { user: user, message: chatBox.value })
            chatBox.value = ''
        }
})

//Recibe la notificacion del backend y la muestra en pantalla.
socket.on('notification', (notification) => {
    notificationContainer.innerHTML = notification

    setTimeout(() => {
        notificationContainer.innerHTML = ''
    }, 3000)
})

//Recibe la coleccion de mesajes previos y los muestra en pantalla
socket.on('messageLogs', (messages) => {
    messageLogs.innerHTML = ''
    
    messages.forEach(message => {
        messageLogs.innerHTML += `<div><span class="message">${message.user} (${message.timestamp})</span>: ${message.content}</div>`
    })
})

//Recibe la info del nuevo mensaje desde el back y lo muestra en pantalla.
socket.on('printNewMessage', ({ user, content, timestamp }) => {
    messageLogs.innerHTML += `<div><span class="message">${user} (${timestamp}): </span>: ${content}</div>`
})