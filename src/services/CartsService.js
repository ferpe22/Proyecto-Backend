const CartsRepository = require('../repositories/CartsRepository');
const ProductsRepository = require('../repositories/ProductsRepositoy');
//const CustomError = require('./Errors/CustomErrors');
//const { generateNotFoundError } = require('./Errors/info');
//const EErrors = require('./Errors/enums')
const { trasportGmail } = require('../config/nodemailer.config') 
const settings = require('../commands/command')

const productsRepository = new ProductsRepository();

class CartService {
  constructor() {
    this.repository = new CartsRepository();
  }

  async getAllCarts() {
    try {
      return this.repository.getAllCarts();
    } catch (error) {
      throw error;
    }
  }

  async getCartById(id) {
    try {
      return this.repository.getCartById(id);
    } catch (error) {
      throw error;
    }
  }

  async addCart() {
    try {
      return this.repository.addCart()
    } catch (error) {
      throw error;
    }
  }

  async addProductToCart(cid, pid, userId) {
    try {
      const cart = await this.repository.getCartById(cid);

      if(cart.length === 0) {
        throw new Error('El carrito no encontrado')
      }

      const product = await productsRepository.getProductById(pid); 

      if(!product) {
        throw new Error('El producto no se encuentra en el inventario')
      }

      if(userId === product.owner) {
        throw new Error('Sos el propietario del producto')
      }

      if(!userId || userId === '1') {
        throw new Error('No eres un usuario admitido para agregar productos a carrito')
      }

      return this.repository.addProductToCart(cid, pid);
    } catch (error) {
      throw error;
    }
  }

  async updateQtyProductInCart(cid, pid, quantity) {
    try {
      const cart = await this.repository.getCartById(cid);
      const product = await productsRepository.getProductById(pid);

      if(!product) {
        throw new Error('El producto no se encuentra en el inventario')
      }

      if (!cart) {
        throw new Error('No se pudo encontrar el carrito')
      }

      const existProdInCart = cart[0].products.findIndex((p) => p.product._id.toString() === pid);

      if(existProdInCart === -1) {
        throw new Error('El producto que desea modificar no se encuentra en el carrito')
      }

      return this.repository.updateQtyProductInCart(cid, pid, quantity);

    } catch (error) {
        throw error;
    }
  }

  async updateArrayProductsInCart(cid, newProducts) {
    try {
      const cart = await this.repository.getCartById(cid);

      if(!cart) {
        throw new Error('No se pudo encontrar el carrito')
      }

      const prodInStock = await productsRepository.getAllProducts()
      const products = prodInStock.products

      newProducts.forEach(p => {
        const pId = p.product
        const quantity = p.quantity

        if(!pId || !quantity){
          throw new Error('Se deben completar los campos de ID y cantidad de productos')
        }

        const stockProductId = products.find(p => p._id.toString() === pId);

        if (!stockProductId){
          throw new Error('Los IDs detallados no corresponden a productos en nuestro stock')
        }
      });

      return this.repository.updateArrayProductsInCart(cid, newProducts);

    } catch (error) {
      throw error;
    }
  }

  async deleteProductInCart(cid, pid) {
    try {
      const cart = await this.repository.getCartById(cid);
      const product = await productsRepository.getProductById(pid);

      if(!product) {
        throw new Error('El producto no se encuentra en el inventario')
      }

      if (!cart) {
        throw new Error('No se encuentra el carrito')
      }

      const existProdInCart = cart[0].products.findIndex((p) => p.product._id.toString() === pid);
      if(existProdInCart === -1) {
        throw new Error('El producto que desea eliminar no se encuentra en el carrito')
      }

      return this.repository.deleteProductInCart(cid, pid);

    } catch (error) {
      throw error;
    }

  }

  async deleteAllProductsInCart(cid) {
    try {
      const cart = await this.repository.getCartById(cid);

      if(!cart) {
        throw new Error('No se encuentra el carrito')
      }

      if(cart[0].products.length === 0) {
        throw new Error('El carrito está vacío')
      }

      return this.repository.deleteAllProductsInCart(cid);
    } catch (error) {
      throw error;
    }
  }

  async deleteCart(cid) {
    return await this.repository.deleteCart(cid);
  }

  async finishPurchase(data) {
    const user = data.user
    let totalAmount = 0
    const prodWithoutStock = []

    try {
      const cart = await this.repository.getCartById(data.cid)
      
      if(!cart) {
        throw new Error('No se pudo encontrar el carrito seleccionado')
      }

      const prodToBuy = cart[0].products

      for(const productData of prodToBuy){
        const product = await productsRepository.getProductById(productData.product)

        if(!product) {
          throw new Error(`El producto "${productData.product.title}" no existe`)
        }

        if (product.stock >= productData.quantity) {
          const productTotal = product.price * productData.quantity
          totalAmount += productTotal
          product.stock -= productData.quantity
          
          await productsRepository.updateProduct(product.id, { stock: product.stock })
        } else {
          prodWithoutStock.push(product._id)
        }
      }

      if (prodWithoutStock.length === cart[0].products.length) {
        throw new Error('No hay stock suficiente para todos los productos')
      }

      const filteredProducts = cart[0].products.filter((productData) => {
        return prodWithoutStock.some(id => id.equals(productData.product._id))
      })

      cart[0].products = filteredProducts

      const dataOrder = {
        amount: totalAmount,
        purchaser: user.email || user.name,
        prodWithoutStock
      }

      if(dataOrder.prodWithoutStock.length === 0) {
        await trasportGmail.sendEmail({
          from: `VendemosTodo <${settings.emailUser}>`,
          to: user.email,
          subject: 'Orden de compra',
          html: `<div>
                  <h1>Gracias por tu compra</h1>
                  <p>El codigo de su orden de compra es: ${dataOrder._id}</p> 
                  <p>El total de tu compra es de: ${dataOrder.amount}</p>
                  <p>Gracias por preferirnos</p>
                </div>`,
          attachments: []
        })

      } else {
        await trasportGmail.sendEmail({
          from: `VendemosTodo <${settings.emailUser}>`,
          to: user.email,
          subject: 'Orden de compra - parcial',
          html: `<div>
                  <h1>Gracias por tu compra</h1>
                  <p>El total de tu compra es de: ${dataOrder.amount}</p>
                  <p>Algunos productos no tienen stock, pero el resto de los productos han sido agregados exitosamente</p>
                  <p>Productos sin stock: ${dataOrder.prodWithoutStock}</p>
                  <p>Gracias por preferirnos</p>
                </div>`,
          attachments: []
        })
      }

      await this.repository.updateArrayProductsInCart(data.cid, cart[0].products)
      
      return this.repository.finishPurchase(dataOrder)

    } catch (error) {
      throw error
    }
  }
}

module.exports = CartService;