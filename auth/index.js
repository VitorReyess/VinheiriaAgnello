import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import User from './models/User.js'; // Importa o modelo de usuário

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4001;
const JWT_SECRET = process.env.SECRET_KEY; // Usamos SECRET_KEY do .env principal

app.use(cors()); // Adiciona CORS
app.use(express.json()); // Habilita o parsing de JSON no corpo das requisições

// Conexão com o MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Auth service connected to MongoDB'))
.catch(err => console.error('Auth service MongoDB connection error:', err));


// Rota de Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth' });
});

// Rota de Registro
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    const newUser = new User({ username, password });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully', userId: newUser._id });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

// Rota de Login
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '1h' } // Token expira em 1 hora
    );

    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Rota para validar token (middleware para uso interno ou teste)
app.get('/validate', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Espera "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ message: 'Token is valid', user: decoded });
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token', error: error.message });
  }
});


app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});