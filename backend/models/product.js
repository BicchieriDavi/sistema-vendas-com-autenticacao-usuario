const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
        unique: true
    },
    preco: {
        type: Number,
        required: true
    },
    qtdEstoque: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model('Product', productSchema)