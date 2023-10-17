const CartsRepository = require('../repositories/CartsRepository');
const productModel = require('../dao/MongoDB/models/productModel');
const cartModel = require('../dao/MongoDB/models/cartModel');
const CustomError = require('./Errors/CustomErrors');
const { generateNotFoundError } = require('./Errors/info');
const EErrors = require('./Errors/enums')

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

  async addProductToCart(cid, pid) {
    try {
      return this.repository.addProductToCart(cid, pid);
    } catch (error) {
      throw error;
    }
  }

  async updateQtyProductInCart(cid, pid, quantity) {
    try {
      const cart = await this.repository.getCartById(cid);
      const product = await productModel.findById(pid);

      if(!product) {
        CustomError.createError({
          name: 'Error de agregado de producto al carrito',
          cause: generateNotFoundError(pid, 'product'),
          message: 'Producto no encontrado en inventario',
          code: EErrors.DATABASE_ERROR
        })
      }

      if (!cart) {
        CustomError.createError({
          name: 'Error de agregado de producto al carrito',
          cause: generateNotFoundError(cid, 'cart'),
          message: 'Carrito no encontrado',
          code: EErrors.DATABASE_ERROR
        })
      }

      const existProdInCart = cart[0].products.findIndex((p) => p.product._id.toString() === pid);

      if(existProdInCart === -1) {
        CustomError.createError({
          name: 'Error de agregado de producto al carrito',
          cause: generateNotFoundError(pid, 'productCart'),
          message: 'El producto que desea actualizar no se encuentra en el carrito',
          code: EErrors.DATABASE_ERROR
        })
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

      const products = await productModel.find();

      newProducts.forEach(p => {
        const pID = p.product
        const quantity = p.quantity

        if(!pID || !quantity){
          throw new Error('Se deben completar los campos de ID y cantidad de productos')
        }

        const stockProductId = products.find(p => p._id.toString() === pID);

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
      const product = await productModel.findById(pid);

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
      const cart = await cartModel.findById(data.cid)
      
      if(!cart) {
        throw new Error('No se pudo encontrar el carrito seleccionado')
      }

      const prodToBuy = cart.products

      for(const productData of prodToBuy.quantity){
        const product = await productModel.findById(productData.product)

        if(!product) {
          throw new Error(`El producto "${productData.product.title}" no existe`)
        }

        if (product.stock >= productData.quantity) {
          const productTotal = product.price * productData.quantity
          totalAmount += productTotal
          product.stock -= productData.quantity
          
          await product.save()
        } else {
          prodWithoutStock.push(product.id)
        }
      }

      if (prodWithoutStock.length === cart.products.length) {
        throw new Error('No hay stock suficiente para todos los productos')
      }

      cart.products = cart.product.filter((productData) => 
        prodWithoutStock.includes(productData.id)
      )

      const dataOrder = {
        purchaser: user.email || user.name,
        amount: totalAmount,
        prodWithoutStock
      }

      await cart.save()
      
      return this.repository.finishPurchase(dataOrder)

    } catch (error) {
      throw error
    }
  }
}

module.exports = CartService;