const express = require('express')
const router = express.Router()
const Order = require('../models/Order')
const Product = require('../models/product')
const verificarToken = require('../middlewares/authMiddleware')

router.post('/orders', verificarToken, async (req, res) => {
    try {
        const userId = req.userId
        const { produtos } = req.body

        if (!produtos || !Array.isArray(produtos) || produtos.length == 0) {
            return res.status(400).json({ message: 'Produto não foi cadastrado no sistema' })
        }

        for (let item of produtos) {
            const produtoBanco = await Product.findById(item.produto)

            if (!produtoBanco) {
                return res.status(404).json({ message: 'Produto não encontrado' })
            }

            if (item.quantidade > produtoBanco.quantidade) {
                return res.status(400).json({ message: 'Quantidade indicada maior que a quantidade em estoque' })
            }
        }

        const novoPedido = new Order({
            usuario: userId,
            produtos: produtos
        })

        await novoPedido.save()

        return res.status(201).json({ message: 'Produto adicionado com sucesso', pedido: novoPedido })

    } catch (error) {
        console.error(error)
        return res.status(400).json({ message: 'Erro ao adicionar produto' })
    }
})

router.get('/orders', verificarToken, async (req, res) => {
    try {
        const userId = req.userId

        const pedidos = await Order.find({ usuario: userId }).populate('produtos.produto')

        if (pedidos.length === 0) {
            return res.status(404).json({ message: 'Não existem pedidos' })
        }

        const pedidoComProdutoExcluido = pedidos.some(pedido =>
            pedido.produtos.some(p => p.produto === null)
        )

        if (pedidoComProdutoExcluido) {
            return res.status(404).json({ message: 'Produto com pedido excluído' })
        }

        return res.status(201).json({ message: 'Pedidos:', pedidos })
    } catch (error) {
        console.error(error)
        return res.status(400).json({ message: 'Erro ao listar pedidos' })
    }
})

router.get('/orders/:id', verificarToken, async (req, res) => {
    try {
        const userId = req.userId;

        const pedido = await Order.findOne({ _id: req.params.id, usuario: userId }).populate('produtos.produto')

        if (!pedido) {
            return res.status(404).json({ message: 'Pedido não encontrado. ' })
        }

        return res.status(201).json({ message: 'Pedido encontrado: ', pedido })
    } catch (error) {
        console.error(error)
        return res.status(400).json({ message: 'Erro ao listar pedido. ' })
    }
})

router.delete('/orders/:id', verificarToken, async (req, res) => {
    try {
        const pedidoRemovido = await Order.findByIdAndDelete(req.params.id)

        if (!pedidoRemovido) {
            return res.status(400).json({ message: 'Erro ao remover pedido' })
        }

        return res.status(200).json({ message: 'Pedido removido.' })

    } catch (error) {
        console.error(error)
        return res.status(400).json({ message: 'Erro ao remover pedido' })
    }
})

module.exports = router