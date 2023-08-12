const mongoose = require('mongoose')

const cartSchema = mongoose.Schema({
    products: Array
})

module.exports = mongoose.model('carts', cartSchema)