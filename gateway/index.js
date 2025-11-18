import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:4001';
const ORDERS_SERVICE_URL = process.env.ORDERS_SERVICE_URL || 'http://localhost:4002';
const JWT_SECRET = process.env.SECRET_KEY;

app.use(cors());
app.use(express.json());

const authenticateJWT = (req, res, next) => {
  
  if (req.path === '/auth/login' || req.path === '/auth/register' || req.path === '/' || req.path === '/auth/health' || req.path === '/orders/health') {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        console.error('JWT verification failed:', err.message);
        return res.status(403).json({ message: 'Forbidden: Invalid or expired token' });
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ message: 'Unauthorized: No token provided' });
  }
};

app.use(authenticateJWT);

app.get('/', (req, res) => {
  res.json({ message: 'API Gateway online. Use /auth/* e /orders/*' });
});

app.use('/auth', createProxyMiddleware({
  target: AUTH_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/auth': '/',
  },
  onProxyReq: (proxyReq, req, res) => {
    
    if (req.user) {
      proxyReq.setHeader('X-User-Id', req.user.userId);
      proxyReq.setHeader('X-Username', req.user.username);
    }
  },
  logLevel: 'debug',
}));


app.use('/orders', createProxyMiddleware({
  target: ORDERS_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/orders': '/',
  },
  onProxyReq: (proxyReq, req, res) => {
    
    if (req.user) {
      proxyReq.setHeader('X-User-Id', req.user.userId);
      proxyReq.setHeader('X-Username', req.user.username);
    }
  },
  logLevel: 'debug',
}));

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});