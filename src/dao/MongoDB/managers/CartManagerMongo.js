const cartModel = require('../models/cartModel')
const productModel = require('../models/productModel')
const TicketManager = require('./TicketManagerMongo')
const ticketManager = new TicketManager()


class CartManager {
    constructor() {
        this.model = cartModel
    }

    async getAllCarts() {
        try {
            const carts = await this.model.find()

            if(carts.length === 0) {
                throw new Error('No hay carritos para mostrar')
            }

            return carts.map(c => c.toObject())
        } catch (error) {
            throw error
        }
    }

    async getCartById(id) {
        try {
            const cart = await this.model.find({_id: id})
            
            if(!cart) {
                throw new Error('No se pudo encontrar el carrito seleccionado')
            }
            return cart
        } catch (error) {
            throw error
        }
    }

    async addCart() {
        try {
            const newCart = await this.model.create({})

            return newCart
        } catch (error) {
            throw error
        }
    }

    async addProductToCart(cid, pid) {
        try {
            const cart = await this.model.findById(cid)
            const product = await productModel.findById(pid)

            if(!product) {
                throw new Error('El producto no se encuentra en el inventario')
            }

            if (!cart) {
                throw new Error('No se encuentra el carrito')
            }

            const existProdInCart = cart.products.findIndex((p) => p.product._id.toString() === pid);

            const productToAdd = {
                product: product.id,
                quantity: 1
            };

            (existProdInCart !== -1)
                ? cart.products[existProdInCart].quantity++
                : cart.products.push(productToAdd);

            await this.model.updateOne(
                { _id: cart._id },
                { $set: { products: cart.products } }
            );

        } catch (error) {
            throw error
        }
    }

    async updateQtyProductInCart(cid, pid, quantity) {
        try {
            const cart = await this.model.findById(cid)
            const product = await productModel.findById(pid)

            if(!product) {
                throw new Error('El producto no se encuentra en el inventario')
            }

            if (!cart) {
                throw new Error('No se encuentra el carrito')
            }

            const existProdInCart = cart.products.findIndex((p) => p.product._id.toString() === pid);

            if (existProdInCart === -1)
                throw new Error('El producto no se encuentra en el carrito')

            await this.model.updateOne(
                { _id: cart._id },
                { $set: { [`products.${existProdInCart}.quantity`]: quantity } }
            );
        
        } catch (error) {
            throw error
        }
    }
    
    async updateArrayProductsInCart(cid, newProducts) {
        try{
            const cart = await this.model.findById(cid)
            const products = await productModel.find()

            if (!cart) {
                throw new Error('No se encuentra el carrito')
            }

            if(products.length === 0){
                throw new Error('No hay productos en inventario')
            }

            if(!newProducts){
                throw new Error('No se puede actualizar la lista de productos sin informaicon del mismo')
            }

            newProducts.forEach((p) => {
                const prodId = p.product;
                const quantity = p.quantity
            

                if(!prodId || quantity){
                    throw new Error('Se deben completar los campos de ID y cantidad de productos')
                }

                const existProductInStock = products.find((p) => p._id.toString() === prodId);

                if(!existProductInStock){
                    throw new Error('Los IDs detallados no corresponden a productos en nuestro stock')
                }
            });

            await this.model.updateOne(
                { _id: cart._id },
                { $set: { products: newProducts } }
            )

        } catch (error) {
            throw error
        }
    }

    async deleteProductInCart(cid, pid) {
        try {
            const cart = await this.model.findById(cid)
            const product = await productModel.findById(pid)

            if(!product) {
                throw new Error('El producto no existe en nuestro inventario')
            }

            if (!cart) {
                throw new Error('No se encuentra el carrito')
            }

            const existProdInCart = cart.products.findIndex((p) => p.product._id.toString() === pid);
            if (existProdInCart === -1)
                throw new Error('El producto no se encuentra en el carrito')

            await this.model.updateOne(
                { _id: cart._id },
                { $pull: { products: { product: product.id } } }
            );

        } catch (error) {
            throw error
        }
    }

    async deleteAllProductsInCart(cid) {
        try {
            const cart = await this.model.findById(cid)

            if (!cart) {
                throw new Error('No se encuentra el carrito')
            }

            if (cart.length === 0) {
                throw new Error('El carrito esta vacio')
            }

            await this.model.updateOne(
                { _id: cart._id },
                { $set: { products: [] } }
            );

        } catch (error) {
            throw error
        }
    }

    async deleteCart(cid) {
        try {
            const cart = await this.model.findById(cid)

            if (!cart) {
                throw new Error('No se encuentra el carrito')
            }

            if (cart.length === 0) {
                throw new Error('El carrito esta vacio')
            }

            await this.model.deleteOne(
                { _id: cart._id }
            );

        } catch (error) {
            throw error
        }
    }

    async finishPurchase(data) {
      try {
        const newOrder = await ticketManager.createOrder({
          amount: data.amount,
          purchaser: data.purchaser
        })
        return {
          purchaser: newOrder.purchaser,
          amount: newOrder.amount,
          prodWithoutStock: newOrder.prodWithoutStock
        }
      } catch (error) {
        throw error
      }
    }
}

module.exports = CartManager