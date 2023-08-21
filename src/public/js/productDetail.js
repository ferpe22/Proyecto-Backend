const socket = io()

const addToCartProdDet = document.querySelector('.addToCartProdDetail form')

    addToCartProdDet.addEventListener('submit', async (e) => {
        e.preventDefault()

        const cid = addToCartProdDet.querySelector('#inputCartId').value
        const pid = addToCartProdDet.getAttribute('id')

        socket.emit('addProductToCart', { cid, pid });

        addToCartProdDet.reset();
    })    


socket.on('notification', n => {
    Swal.fire({
        icon: n.type === 'success' ? 'success' : 'error',
        text: n.message,
        timer: 2500
    })
})