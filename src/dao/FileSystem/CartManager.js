const fs = require('fs')
const ProductManager = require('./ProductManager')
const { error } = require('console')
const managerProd = new ProductManager('./src/products.json')

class CartManager {
    constructor(path) {
        this.path = path
    }

    async getCarts () {
        await fs.promises.readFile(this.path, 'utf-8')
        .then((cartsString) => {
            if(cartsString === '') {
                return []
            }
            const carritos = JSON.parse(cartsString)
            return carritos
        })
        .catch(error => {
            console.log('Error al leer el archivo', error)
            return console.log('carrito vacio') 
        }) 
    }
    
    async addCart(data) {
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

    async getCartById (id) {
        await this.getCarts()
        .then(carts => {
            const cart = carts.find( cart => cart.id === id)
            if(!cart) {
                throw new Error('El carrito no existe')
            }
            return cart
        })
        .catch(error => {
            console.log('Error al obtener el carrito')
            return error
        })
    }

    async productsStock() {
        try {
            const data = await fs.promises.readFile('./src/products.json', 'utf-8')
            const products = JSON.parse(data)
            return products
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    async addProductToCart(cid, pid) {
        try{
            const cart = await this.getCartById(cid)
            const products = await this.productsStock()
            const product = await this.getProductById(pid)

            if(!product) {
                throw new Error('El producto no se encuentra en el inventario')
            }

            const productToAdd = {
                product : product.id,
                quantity: 1
            }

            const existProductInCart = cart.products.findIndex(prod => prod.product === pid)

            (!existProductInCart !== -1)
                ? cart.products[existProductInCart].quantity++
                : cart.products.push(productToAdd)
            
                cart.products.sort((a, b) => a.product - b.product);
                return fs.promises.writeFile(this.path, JSON.stringify(cart, null, 2))
        } catch (error) {
            console.log('Error al agregar el producto al carrito')
            return error
        }
        
    }

    async updateCart(id, data) {
        await this.getCarts()
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
}

module.exports = CartManager