const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2') 

const productSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        set: value => parseFloat(value)
    },
    thumbnail: [
        { type: String, }
    ],
    code: {
        type: String,
        required: true,
        unique: true,
    },
    stock: {
        type: Number,
        required: true,
        set: value => parseFloat(value)
    },
    status: {
        type: Boolean,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    status: {
        type: Boolean,
        required: true,
    },
})

mongoose.plugin(mongoosePaginate)
module.exports = mongoose.model('products', productSchema)