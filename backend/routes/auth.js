const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User.js')
const verificarToken = require('../middlewares/authMiddleware.js')

router.post('/register', async (req, res) => {
    try {
        const { nome, email, senha } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({ message: 'Preencha todos os campos.' })
        }

        const usuarioExiste = await User.findOne({ email })
        if (usuarioExiste) {
            return res.status(400).json({ message: 'Usuario já existe.' })
        }

        const senhaCriptografada = await bcrypt.hash(senha, 10)

        const newUser = new User({
            nome,
            email,
            senha: senhaCriptografada
        })

        await newUser.save()

        const { senha: _, ...userSemSenha } = newUser.toObject()
        res.status(201).json({ message: 'Usuário registrado com sucesso!', user: userSemSenha })

    } catch (error) {
        console.error(error)
        res.status(501).json({ message: 'Erro ao registrar usuário.' })
    }
})

router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body

        const usuario = await User.findOne({ email })
        if (!usuario) {
            return res.status(401).json({ message: 'Usuário ou senha inválido' })
        }

        const matchSenha = await bcrypt.compare(senha, usuario.senha)
        if (!matchSenha) {
            return res.status(401).json({ message: 'Usuário ou senha inválido' })
        }

        const token = jwt.sign(({ id: usuario._id }), process.env.JWT_SECRET, { expiresIn: '2h' })

        return res.status(200).json({ message: 'Login realizado com sucesso', token: token })


    } catch (error) {
        console.error(error)
        res.status(501).json({ message: 'Erro ao realizar login.' })
    }
})

module.exports = router