const express = require('express')
const router = express.Router()
const Product = require('../models/product')
const verificarToken = require('../middlewares/authMiddleware')

router.post('/products', verificarToken, async (req, res) => {
    try {
        const { nome, preco, qtdEstoque } = req.body

        if (nome == null || preco == null || qtdEstoque == null) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios' })
        }

        const produtoExiste = await Product.findOne({ nome })
        if (produtoExiste) {
            return res.status(400).json({ message: 'Esse produto já está cadastrado!' })
        }

        if (qtdEstoque <= 0) {
            return res.status(400).json({ message: 'Quantidade inválida.' })
        }

        const newProduct = new Product({
            nome, preco, qtdEstoque
        })

        await newProduct.save()

        return res.status(201).json({ message: 'Produto cadastrado com sucesso!', newProduct })

    } catch (error) {
        console.error(error)
        return res.status(400).json({ message: 'Erro ao cadastrar produto' })
    }
})

router.get('/products', verificarToken, async (req, res) => {
    try {

        const produtos = await Product.find()

        if (produtos.length === 0) {
            return res.status(400).json({ message: 'Não existem produtos cadastrados no sistema' })
        }

        return res.status(200).json({ message: 'Produtos cadastrados:', produtos })

    } catch (error) {
        console.error(error)
        return res.status(400).json({ message: 'Erro ao retornar produtos' })
    }
})

router.get('/products/:id', verificarToken, async (req, res) => {
    try {
        const produto = await Product.findById(req.params.id)

        if (!produto) {
            return res.status(404).json({ message: 'Produto não encontrado.' })
        }

        return res.status(200).json({ message: 'Produto encontrado: ', produto })

    } catch (error) {
        console.error(error)
        return res.status(400).json({ message: 'Error ao listar produto!' })
    }
})

router.put('/products/:id', verificarToken, async (req, res) => {
    try {

        const { nome, preco, qtdEstoque } = req.body

        const produto = await Product.findById(req.params.id)

        if (!produto) {
            return res.status(400).json({ message: 'Produto não encontrado' })
        }

        if (qtdEstoque <= 0) {
            return res.status(400).json({ message: 'Quantidade inválida' })
        }


        const dadosAtualizados = {
            nome: nome ?? produto.nome,
            preco: preco ?? produto.preco,
            qtdEstoque: qtdEstoque ?? produto.qtdEstoque
        }

        const produtoAtualizado = await Product.findByIdAndUpdate(req.params.id, dadosAtualizados, { new: true })

        return res.status(200).json({ message: 'Produto atualizado com sucesso!', produtoAtualizado })
    } catch (error) {
        console.error(error)
        return res.status(400).json({ message: 'Erro ao atualizar produto.' })
    }
})

router.delete('/products/:id', verificarToken, async (req, res) => {
    try {

        const produtoRemovido = await Product.findByIdAndDelete(req.params.id)

        if (!produtoRemovido) {
            return res.status(400).json({ message: 'Erro ao deletar produto' })
        }

        return res.status(200).json({ message: 'Produto deletado com sucesso! ', produtoRemovido })

    } catch (error) {
        console.error(error)
        return res.status(400).json({ message: 'Erro ao remover produto.' })
    }
})

module.exports = router