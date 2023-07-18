const socket = io()

console.log(socket)

const titleInput = document.getElementById('titleInput')
const descriptionInput = document.getElementById('descriptionInput')
const priceInput = document.getElementById('priceInput')
const codeInput = document.getElementById('codeInput')
const stockInput = document.getElementById('stockInput')
const categoryInput = document.getElementById('categoryInput')
const statusInput= document.getElementById('statusInput')
const formBtn = document.getElementById('formBtn')

formBtn.addEventListener('submit', (event) => {
    event.preventDefault()

    const title = titleInput.value
    const description = descriptionInput.value
    const price = priceInput.value
    const code = codeInput.value
    const stock = stockInput.value
    const category = categoryInput.value
    const status = statusInput.value

    console.log( { title, description, price, code, stock, category, status})

    socket.emit('EnviarNewProduct', JSON.stringify({ title, description, price, code, stock, category, status }))
})

const deleteProduct = (id) => {
    console.log('fn', id)
    socket.emit('borrarProducto', id)

    fetch(``, {
        method: 'DELETE',
    })
}

socket.on('nuevoProducto', (data) => {
    const product = JSON.parse(data)

    const productHTML = `
    <tr>
        <td>${product.title}</td>
        <td>${product.description}</td>
        <td>${product.price}</td>
        <td>${product.code}</td>
        <td>${product.stock}</td>
        <td>${product.category}</td>
        <td>${product.status}</td>
    </tr>
    `

    const table = document.getElementById('productos')

    table.innerHTML += productHTML
})