const fs = require('fs')
const ProductManager = require('./ProductManager')
const managerProd = new ProductManager('./src/products.json')

class CartManager {
    constructor(path) {
        this.path = path
    }

    getCarts () {
        return fs.promises.readFile(this.path, 'utf-8')
        .then((cartsString) => {
            if(cartsString === '') {
                return []
            }
            const carritos = JSON.parse(cartsString)
            return carritos
        })
        .catch(err => {
            console.log('Error al leer el archivo', err)
            return console.log('carrito vacio') 
        }) 
    }
    
    addCart(data) {
        const nvoCarrito = {
            products: data.products || []
        }

        return this.getCarts()
            .then(carts => {
                nvoCarrito.id = carts.length + 1
                carts.push(nvoCarrito)

                return fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2))
            })
            .catch(err => {
                console.log('Error al agregar el carrito')
                return err
            })

    }

    getCartById (id) {
        return this.getCarts()
        .then(carts => {
            const cart = carts.find( cart => cart.id === id)
            return cart
        })
        .catch(err => {
            console.log('Error al obtener el carrito')
            return err
        })
    }

    updateCart(id, data) {
        return this.getCarts()
        .then(carts => {
            const cartIndex = carts.findIndex(carrito => carrito.id === id)

            if(cartIndex !== -1) {
                carts[cartIndex].products = data.products
                return fs.promises.writeFile(this.path, JSON.stringify(products, null, 2))
            }

            })
        .catch(error => {
            console.log('Error al actualizar el carrito')
            return error
        })
    }

    addProductToCart(cid, pid) {
        
    }

}


module.exports = CartManager