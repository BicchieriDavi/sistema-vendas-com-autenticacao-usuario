const express = require('express')
require('dotenv').config()
const mongoose = require('mongoose')
const cors = require('cors')

const authRoutes = require('./routes/auth')
const productRoutes = require('./routes/products')
const orderRoutes = require('./routes/orders')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({
    origin: 'http://localhost:8080', // Permite apenas seu frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'] // Cabeçalhos permitidos
}))

app.use(express.json())

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Conectado ao Banco de Dados!'))
    .catch(err => console.log(`Deu ruim: ${err}`))

app.use('/auth', authRoutes)
app.use('/products', productRoutes)
app.use('/orders', orderRoutes)

app.listen(PORT, () => console.log(`Servidor rodando na porta: ${PORT}`))