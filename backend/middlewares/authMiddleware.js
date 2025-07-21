const express = require('express')
const jwt = require('jsonwebtoken')

function verificarToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
        res.status(400).json({ message: 'Token não encontrado.' })
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(400).json({ message: 'Token inválido ou expirado!' })
        }
        req.userId = decoded.id
        next()
    })
}

module.exports = verificarToken