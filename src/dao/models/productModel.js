const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    thumbnail: String,
    code: {
        type: String,
        unique: true
    },
    stock: Number,
    category: String,
    status: Boolean,
})

module.exports = mongoose.model('products', productSchema)