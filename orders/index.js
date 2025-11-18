import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import Order from './models/Order.js'; // Importa o modelo de pedido - CORRETO: .js no final

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4002;

app.use(cors()); // Adiciona CORS
app.use(express.json()); // Habilita o parsing de JSON no corpo das requisições

// Conexão com o MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Orders service connected to MongoDB'))
.catch(err => console.error('Orders service MongoDB connection error:', err));

// Rota de Health Check
app.get('/health', (req, res) => {
  const discountFeature = process.env.FEATURE_DISCOUNT === 'true';
  res.json({ status: 'ok', service: 'orders', feature_discount: discountFeature });
});

// Rota para criar um novo pedido
app.post('/orders', async (req, res) => {
  try {
    // O userId vem do Gateway, que validou o token
    const userId = req.headers['x-user-id']; // Acessa o header 'x-user-id'
    const username = req.headers['x-username']; // Acessa o header 'x-username'

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User ID not provided by Gateway' });
    }

    const { items, totalAmount } = req.body;
    if (!items || !totalAmount) {
      return res.status(400).json({ message: 'Items and totalAmount are required' });
    }

    const newOrder = new Order({
      userId: new mongoose.Types.ObjectId(userId), // Converte o ID string para ObjectId
      items,
      totalAmount
    });

    await newOrder.save();

    res.status(201).json({ message: 'Order created successfully', order: newOrder, createdBy: username });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
});

// Rota para listar pedidos (apenas os do usuário autenticado)
app.get('/orders', async (req, res) => {
  try {
    const userId = req.headers['x-user-id']; // Pega o ID do usuário do Gateway

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User ID not provided by Gateway' });
    }

    const orders = await Order.find({ userId: new mongoose.Types.ObjectId(userId) });
    res.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Orders service running on port ${PORT}, discount feature: ${process.env.FEATURE_DISCOUNT}`);
});