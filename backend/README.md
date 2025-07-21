
---

````markdown
# Sistema de Vendas - Backend com Node.js + Frontend com Lovable

Este projeto é um sistema completo de vendas, composto por um **backend em Node.js com Express** e **MongoDB**, e um **frontend moderno gerado com a IA Lovable**. A aplicação permite realizar **autenticação de usuários**, **cadastro e listagem de produtos**, **emissão de pedidos** e **visualização de pedidos por usuário**.

---

## ✨ Funcionalidades

### Backend (Node.js + Express)
- Registro e login de usuários com JWT.
- Middleware de autenticação para rotas protegidas.
- Cadastro, listagem, edição e exclusão de produtos.
- Criação e consulta de pedidos vinculados a usuários autenticados.
- Integração com MongoDB.

### Frontend
- Interface moderna e intuitiva.
- Tela de login, registro, listagem de produtos e pedidos.
- Consome a API criada com este backend.

---

## 🧠 Tecnologias Utilizadas

### Backend:
- Node.js
- Express
- MongoDB (via Mongoose)
- JWT (Json Web Token)
- bcryptjs
- dotenv
- cors

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos
- Node.js instalado
- MongoDB em execução (local ou via MongoDB Atlas)
- npm instalado

### Backend

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/seu-repositorio.git
   cd seu-repositorio/backend
````

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Crie um arquivo `.env` na raiz do projeto com as variáveis:

   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/sistemavendas
   JWT_SECRET=sua_chave_secreta
   ```

4. Inicie o servidor:

   ```bash
   node server.js
   ```

> O backend ficará disponível em: `http://localhost:3000`

---

### Frontend

1. Acesse a pasta do frontend:

   ```bash
   cd frontend
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

> O frontend estará rodando em: `http://localhost:8080`

---

## 📂 Estrutura de Pastas

```
.
─ backend
   ├── models
   ├── routes
   ├── middlewares
   ├── server.js
   └── .env
```

---

## 🔐 Autenticação

Este projeto utiliza **JWT (JSON Web Tokens)** para proteger as rotas do backend. Ao fazer login, o usuário recebe um token que deve ser enviado no cabeçalho `Authorization` das requisições protegidas.

Exemplo:

```
Authorization: Bearer seu_token_aqui
```

---

## 📦 Rotas da API

### Autenticação

* `POST /auth/register` - Registro
* `POST /auth/login` - Login

### Produtos

* `POST /products` - Criar produto
* `GET /products` - Listar todos
* `GET /products/:id` - Buscar por ID
* `PUT /products/:id` - Atualizar produto
* `DELETE /products/:id` - Deletar produto

### Pedidos

* `POST /orders` - Criar pedido
* `GET /orders` - Listar pedidos do usuário autenticado
* `GET /orders/:id` - Detalhar pedido específico

```