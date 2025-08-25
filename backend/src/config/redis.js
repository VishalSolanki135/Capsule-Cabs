import redis from 'redis';
import logger from '../utils/logger.js';

let redisClient;

const connectRedis = async () => {
  try {
    redisClient = redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      retry_strategy: (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          logger.error('The Redis server refused the connection');
          return new Error('The Redis server refused the connection');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          logger.error('Redis retry time exhausted');
          return new Error('Retry time exhausted');
        }
        if (options.attempt > 10) {
          logger.error('Redis retry attempts exhausted');
          return new Error('Retry attempts exhausted');
        }
        return Math.min(options.attempt * 100, 3000);
      }
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    redisClient.on('ready', () => {
      logger.info('Redis client ready');
    });

    redisClient.on('error', (err) => {
      logger.error('Redis client error:', err);
    });

    redisClient.on('end', () => {
      logger.warn('Redis client connection ended');
    });

    await redisClient.connect();
    
    logger.info('Redis Connected Successfully');
    return redisClient;
  } catch (error) {
    logger.error('Redis connection error:', error);
    throw error;
  }
};

const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
};

// Cache service utility functions
const cacheService = {
  // Set cache with expiration
  async set(key, value, expireInSeconds = 3600) {
    try {
      const client = getRedisClient();
      await client.setEx(key, expireInSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  },

  // Get cache
  async get(key) {
    try {
      const client = getRedisClient();
      const value = await client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  },

  // Delete cache
  async del(key) {
    try {
      const client = getRedisClient();
      await client.del(key);
      return true;
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  },

  // Delete multiple keys
  async delPattern(pattern) {
    try {
      const client = getRedisClient();
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
      }
      return true;
    } catch (error) {
      logger.error('Cache delete pattern error:', error);
      return false;
    }
  },

  // Check if key exists
  async exists(key) {
    try {
      const client = getRedisClient();
      const exists = await client.exists(key);
      return exists === 1;
    } catch (error) {
      logger.error('Cache exists error:', error);
      return false;
    }
  },

  // Set expiration
  async expire(key, seconds) {
    try {
      const client = getRedisClient();
      await client.expire(key, seconds);
      return true;
    } catch (error) {
      logger.error('Cache expire error:', error);
      return false;
    }
  },

  // Increment counter
  async incr(key) {
    try {
      const client = getRedisClient();
      return await client.incr(key);
    } catch (error) {
      logger.error('Cache increment error:', error);
      return 0;
    }
  },

  // Set if not exists
  async setNX(key, value, expireInSeconds = 3600) {
    try {
      const client = getRedisClient();
      const result = await client.set(key, JSON.stringify(value), {
        NX: true,
        EX: expireInSeconds
      });
      return result === 'OK';
    } catch (error) {
      logger.error('Cache setNX error:', error);
      return false;
    }
  }
};

export { connectRedis, getRedisClient, cacheService };