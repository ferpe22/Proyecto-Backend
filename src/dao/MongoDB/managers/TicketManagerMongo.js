const ticketModel = require('../models/ticketModel')
const { v4: uuidv4 } = require('uuid')

class TicketManager {
  constructor() {
    this.model = ticketModel
  }

  async getOrderById(id) {
    try {
      const order = await ticketModel.findOne({_id: id})

      if(!order) {
        throw new Error('No se encontro la orden')
      }
      return order

    } catch (error) {
      throw error
    }
  }

  async createOrder(data) {
    try {
      const newOrder = await ticketModel.create({
        code: uuidv4(),
        amount: data.amount,
        purchaser: data.purchaser
      })

      return newOrder
      
    } catch (error) {
      throw error
    }
  }
}

module.exports = TicketManager