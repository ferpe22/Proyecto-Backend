const socket = io()

const addToCartSection = document.querySelectorAll('.addToCart form')

addToCartSection.forEach((form) => {
    form.addEventListener('submit', async (e) => {
        e.preventDefault()

        const cid = form.querySelector('#inputCartId').value
        const pid = form.getAttribute('id')

        socket.emit('addProductToCart', { cid, pid })

        form.reset()
    })    
})

socket.on('notification', n => {
    Swal.fire({
        icon: n.type === 'success' ? 'success' : 'error',
        text: n.message,
        timer: 2500
    })
})