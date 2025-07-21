const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    produtos: [{
        produto: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantidade: { type: Number, required: true, default: 1 }
    }],
    dataPedido: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Order', orderSchema)