const CartsService = require('../services/CartsService')
const { transportGmail } = require('../config/nodemailer.config')
const settings = require('../commands/command')

class CartsController {
  constructor() {
    this.service = new CartsService()
  }

  async getAllCarts(req, res) {
    try {
      const carts = await this.service.getAllCarts()

      if(carts.length === 0) {
        //return res.status(404).send({ status: 'error', message: 'Carrito no encontrado'})
        return res.sendError(404, 'Carrito no encontrado')
      }

      //return res.status(200).json({ status: 'success', payload: carts})
      return res.sendSuccess(200, carts)

    } catch (error) {
      //return res.status(500).json({ error: 'Error al obtener los carritos', message: error.message })
      return res.sendError(500, 'Error al obtener los carritos', error)
    }
  }

  async getCartById(req, res) {
    const cid = req.params.cid
    try {
      const cart = await this.service.getCartById(cid)

      if(cart.length === 0) {
        //return res.status(404).send({ status: 'error', message: 'Carrito no encontrado'})
        return res.sendError(404, 'Carrito no encontrado')
      }

      //return res.status(200).json({ status: 'success', payload: cart})
      return res.sendSuccess(200, cart)

    } catch (error) {
      //return res.status(500).send({ error: 'Error al obtener el carrito', message: error.message })
      return res.sendError(500, 'Error al obtener los carritos', error)
    }
  }

  async addCart(req, res) {
    try {
      await this.service.addCart()
      //return res.status(201).json({ status: 'success', message: 'Carrito agregado exitosamente' })
      return res.sendSuccess(201, 'Agregado exitosamente')

    } catch (error) {
      //return res.status(500).send({ error: 'Error al agregar el carrito', message: error.message })
      return res.sendError(500, 'Error al agregar al carrito', error)
    }
  }

  async addProductToCart(req, res) {
    const cid = req.params.cid
    const pid = req.params.pid

    try {
      await this.service.addProductToCart(cid, pid)

      //return res.status(201).send({ status: 'success', message: 'Producto agregado al carrito exitosamente' })
      return res.sendSuccess(201, 'Agregado exitosamente')

    } catch (error) {
      if (error.message === 'El producto no se encuentra en el inventario') {
          //return res.status(404).send({ error: 'Product Not Found', message: 'El producto que intentas agregar no se encuentra en inventario' })
          return res.sendError(404, { ...error, cause: error.cause })
      }

      if (error.message === 'No se encuentra el carrito') {
          //return res.status(404).send({ error: 'Cart Not Found', message: 'No se pueda ingresar productos a un carrito inexistente' })
          return res.sendError(404, { ...error, cause: error.cause })
      }

      //return res.status(500).send({ error: 'Error al guardar el producto en el carrito', message: error.message })
      return res.sendError(500, error)
    }
  }

  async updateQtyProductInCart(req, res) {
    const { cid, pid } = req.params
    const quantity = req.body.quantity

    try {
      if (quantity === null || quantity === undefined) {
        //return res.status(409).send({ error: 'Update error', message: 'Se deben completar el campo de cantidad' })
        return res.sendError(409, 'Se deben completar el campo de cantidad')
      } if (quantity < 0) {
        //return res.status(409).send({ error: 'Update error', message: 'La cantidad debe ser positiva' })
        return res.sendError(409, 'La cantidad debe ser positiva')
      }

      await this.service.updateQtyProductInCart(cid, pid, quantity)

      //return res.status(200).send({ status: 'success', message: 'La actualizacion ha sido exitosa' })
      return res.sendSuccess(200, 'La actualizacion ha sido exitosa')

    } catch (error) {
      if (error.message === 'El producto no se encuentra en el inventario' || error.message === 'No se encuentra el carrito' || error.message === 'El producto que desea actualizar no se encuentra en el carrito') {
        //return res.status(404).send({ error: 'Update error', message: error.message })
        return res.sendError(404, error)
      }

      //return res.status(500).send({ error: 'Error al actualizar el carrito', message: error.message })
      return res.sendError(500, 'Error al actualizar el producto en el carrito', error)
    }
  }

  async updateArrayProductsInCart(req, res) {
    const { newProducts } = req.body
    const cid = req.params.cid

    try{
      if(!newProducts) {
        //return res.status(409).send({ error: 'Product Not Found', message: 'No se puede actualizar la lista de productos sin informaicon del mismo' })
        return res.sendError(409, 'No se puede actualizar la lista de productos sin informaicon del mismo')
      }
      
      await this.service.updateQtyProductInCart(cid, newProducts)
      
      //return res.status(200).send({ status: 'success', message: 'La actualizacion ha sido exitosa' })
      return res.sendSuccess(200, 'La actualizacion ha sido exitosa')

    } catch (error) {
      //return res.status(500).send({ error: 'Error al actualizar el carrito', message: error.message })
      return res.sendError(500, 'Error al actualizar el carrito', error)
    }
  }

  async deleteProductInCart(req, res) {
    const { cid, pid } = req.params
    try {
      await this.service.deleteProductInCart(cid, pid)

      //return res.status(200).send({ status: 'success', message: 'Producto eliminado del carrito exitosamente' })
      return res.sendSuccess(200, 'Producto eliminado del carrito exitosamente')

    } catch (error) {
      if (error.message === 'El producto no se encuentra en el carrito' || error.message === 'El producto que intentas borrar no se encuentra en el carrito' || error.message === 'No se encuentra el carrito') {
        //return res.status(404).send({ error: 'Product or Cart Not Found', message: error.message })
        return res.sendError(404, error.message)
      }
      //return res.status(500).send({ error: 'Error al borrar el producto del carrito', message: error.message })
      return res.sendError(500, 'Error al borrar el producto del carrito', error)
    }
  }

  async deleteAllProductsInCart(req, res) {
    const cid = req.params.cid
    try {
      await this.service.deleteAllProductsInCart(cid)

      //return res.status(200).send({ status: 'success', message: 'Productos eliminados del carrito exitosamente' })
      return res.sendSuccess(200, 'Productos eliminados del carrito exitosamente')

    } catch (error) {
      if (error.message === 'No se encuentra el carrito') {
        //return res.status(404).send({ error: 'Cart Not Found', message: error.message })
        return res.sendError(404, error.message)
      }
      if (error.message === 'El carrito está vacío') {
        //return res.status(409).send({ error: 'Cart Not Found', message: error.message })
        return res.sendError(409, error.message)
      }

      //return res.status(500).send({ error: 'Error al borrar todos los productos del carrito', message: error.message })
      return res.sendError(500, 'Error al borrar todos los productos del carrito', error)
    }
  }

  async finishPurchase(req, res) {
    const cid = req.params.cid
    const user = req.user

    try {
      if (cid !== user.cart) {
        //return res.status(500).send({ error: 'EL carrito no corresponde al usuario', message: error.message })
        return res.sendError(500, 'EL carrito no corresponde al usuario')
      }

      const order = await this.service.finishPurchase({ cid, user })
      let result;
      try {
        if (order.prodWithoutStock.length === 0) {
          result = await transportGmail.sendMail({
            from: `VendemosTodo <${settings.emailUser}>`,
            to: user.email,
            subject: 'Orden de compra',
            html: `<div>
                    <h1>Gracias por tu compra</h1>
                    <p>El codigo de su orden de compra es: ${order._id}</p> 
                    <p>El total de tu compra es de: ${order.totalAmount}</p>
                    <p>Gracias por preferirnos</p>
                  </div>`,
            attachments: []
          });
          console.log('Correo enviado con éxito', result. response)
        } else {
          result = await transportGmail.sendMail({
            from: `VendemosTodo <${settings.emailUser}>`,
            to: user.email,
            subject: 'Orden de compra Incompleta',
            html: `<div>
                    <h1>Gracias por tu compra</h1>
                    <p>El codigo de su orden de compra es: ${order._id}</p> 
                    <p>El total de tu compra es de: ${order.totalAmount}</p>
                    <p>Algunos productos no han podido ser agregados ya que no cuentan con stock</p>
                    <p>Productos sin stock: ${order.prodWithoutStock.join(', ')}</p>
                    <p>Gracias por preferirnos</p>
                  </div>`,
            attachments: []
          })
          console.log('Correo enviado con éxito', result.response)
        }
      } catch (emailError) {
        console.log('Error al enviar el email', emailError)
      }

      //return res.status(201).json({ status: 'success', payload: order })
      return res.sendSuccess(201, order)

    } catch (error) {
        if(error.message === 'No hay stock suficiente para todos los productos') {
          //return res.status(409).send({ message: error.message })
          return res.sendError(409, error.message)
        }
        //return res.status(500).send({ error: 'Error al finalizar la compra', message: error.message })
        return res.sendError(500, 'Error en la compra', error)
    }
  }
}

module.exports = CartsController