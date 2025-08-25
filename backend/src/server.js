import express, { json, urlencoded } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

// Import configurations and utilities
import connectDB from './config/database.js';
import { connectRedis } from './config/redis.js';
import { info, error as _error } from './utils/logger.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

// Import routes
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/userRoutes.js';
import routeRoutes from './routes/routeRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

// Import socket handlers
import socketHandler from './sockets/socketHandler.js';

// Import scheduled jobs
import './jobs/scheduledJobs.js';

class Server {
  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
        methods: ['GET', 'POST']
      }
    });
    this.port = process.env.PORT || 5000;
    
    this.initializeDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeSocketHandlers();
    this.initializeErrorHandlers();
  }

  async initializeDatabase() {
    try {
      await connectDB();
      // await connectRedis();
      info('Database connections established');
    } catch (error) {
      _error('Database connection failed:', error);
      process.exit(1);
    }
  }

  initializeMiddlewares() {
    // Security middlewares
    this.app.use(helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false
    }));
    
    this.app.use(cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
      credentials: true
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000,
      max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false
    });
    this.app.use('/api', limiter);

    // Data sanitization
    this.app.use(mongoSanitize());
    this.app.use(xss());
    this.app.use(hpp());

    // Compression and logging
    this.app.use(compression());
    this.app.use(morgan('combined', { stream: { write: message => info(message.trim()) } }));

    // Body parsing
    this.app.use(json({ limit: '10mb' }));
    this.app.use(urlencoded({ extended: true, limit: '10mb' }));

    // Make io accessible in routes
    this.app.use((req, res, next) => {
      req.io = this.io;
      next();
    });
  }

  initializeRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
      });
    });

    // API routes
    this.app.use('/api/v1/auth', authRoutes);
    this.app.use('/api/v1/users', userRoutes);
    this.app.use('/api/v1/routes', routeRoutes);
    this.app.use('/api/v1/bookings', bookingRoutes);
    this.app.use('/api/v1/payments', paymentRoutes);
    this.app.use('/api/v1/notifications', notificationRoutes);

    // API documentation
    this.app.get('/api/v1', (req, res) => {
      res.json({
        name: 'Seat Selekta Pro API',
        version: '1.0.0',
        description: 'Backend API for Bus/Cab Booking Service',
        endpoints: {
          auth: '/api/v1/auth',
          users: '/api/v1/users',
          routes: '/api/v1/routes',
          bookings: '/api/v1/bookings',
          payments: '/api/v1/payments',
          notifications: '/api/v1/notifications'
        },
        documentation: 'https://github.com/VishalSolanki135/seat-selekta-pro'
      });
    });
  }

  initializeSocketHandlers() {
    socketHandler(this.io);
  }

  initializeErrorHandlers() {
    this.app.use(notFound);
    this.app.use(errorHandler);
  }

  start() {
    this.server.listen(this.port, () => {
      info(`Server running on port ${this.port} in ${process.env.NODE_ENV} mode`);
    });
  }
}

// Create and start server
const server = new Server();
server.start();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  _error('Unhandled Promise Rejection:', err);
  server.server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  _error('Uncaught Exception:', err);
  process.exit(1);
});

export default server;