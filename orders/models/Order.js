import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  userId: { // ID do usuário que fez o pedido
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  items: [ // Array de itens no pedido
    {
      name: String,
      quantity: Number,
      price: Number
    }
  ],
  totalAmount: { // Valor total do pedido
    type: Number,
    required: true,
  },
  createdAt: { // Data de criação do pedido
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model('Order', OrderSchema);

export default Order;