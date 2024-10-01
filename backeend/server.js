const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

// Crie o app Express
const app = express();
const PORT = 3000;
const SECRET_KEY = 'minhaChaveSecreta'; // Defina uma chave secreta forte para gerar o token JWT

// Middleware
app.use(cors());
app.use(express.json());

// Usuário fake para o exemplo (em produção, isso viria do banco de dados)
const users = [
    { id: 1, username: 'usuario1', password: bcrypt.hashSync('senha123', 10) }
];

// Rota de login
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;

    // Verificar se o usuário existe
    const user = users.find(u => u.username === username);
    if (!user) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Verificar a senha
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Gerar um token JWT
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });

    res.json({ token });
});

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // 'Bearer token'

    if (!token) return res.sendStatus(403);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Rota protegida de plantações
app.get('/api/plantacoes', authenticateToken, (req, res) => {
    const plantacoes = [
        { id: 1, nome: 'Plantação A' },
        { id: 2, nome: 'Plantação B' },
    ];

    res.json(plantacoes);
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
