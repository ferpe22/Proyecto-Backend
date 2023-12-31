const socket = io()

const titleInput = document.getElementById('titleInput')
const descriptionInput = document.getElementById('descriptionInput')
const priceInput = document.getElementById('priceInput')
const codeInput = document.getElementById('codeInput')
const stockInput = document.getElementById('stockInput')
const categoryInput = document.getElementById('categoryInput')
const statusInput= document.getElementById('statusInput')
const formBtn = document.getElementById('formBtn')

//Envias el form y emitis un mensaje al Back con la info del producto agregado
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

    socket.emit('AddProduct', JSON.stringify({ title, description, price, code, stock, category, status }))

    formBtn.reset()
})

const deleteProduct = (id) => {
    fetch(`/api/products/${id}`, {
        method: 'DELETE',
    })
}

socket.on('newProductToAdd', (data) => {
    const product = JSON.parse(data)

    const productHTML = `
    <tr>
        <td>${product._id}</td>
        <td>${product.title}</td>
        <td>${product.description}</td>
        <td>${product.code}</td>
        <td>${product.category}</td>
        <td>${product.stock}</td>
        <td>${product.price}</td>
        <td>${product.status}</td>
    </tr>
    `

    const table = document.getElementById('productos')
    console.log(table)

    table.innerHTML += productHTML
})

socket.on('productDeleted', (id) => {
    deleteProduct(id)
})