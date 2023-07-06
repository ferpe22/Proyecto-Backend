const fs = require('fs')

class CartManager {
    constructor(path) {
    this.path = path
    }

    getCarts () {
    return fs.promises.readFile(this.path, 'utf-8')
        .then((cartsString) => {
            const carritos = JSON.parse(cartsString)
            return carritos
        })
        .catch(err => {
            console.log('Error al leer el archivo', err)
            return console.log('carrito vacio') 
        }) 
    }

    addCart (data) {
        const nvoCarrito = {
            products: data.products || []
        }

        return this.getCarts()
            .this(carts => {
                nvoCarrito.id = carts.length + 1,
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
}


module.exports = CartManager