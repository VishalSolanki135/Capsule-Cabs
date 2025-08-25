import logger from '../utils/logger.js';

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.id}`);

    // Handle seat selection
    socket.on('select-seat', (data) => {
      try {
        // Placeholder - implement actual seat selection logic
        logger.info(`Seat selection: ${JSON.stringify(data)}`);
        socket.emit('seat-selected', { success: true, data });
      } catch (error) {
        logger.error('Seat selection error:', error);
        socket.emit('seat-selected', { success: false, error: error.message });
      }
    });

    // Handle seat release
    socket.on('release-seat', (data) => {
      try {
        // Placeholder - implement actual seat release logic
        logger.info(`Seat release: ${JSON.stringify(data)}`);
        socket.emit('seat-released', { success: true, data });
      } catch (error) {
        logger.error('Seat release error:', error);
        socket.emit('seat-released', { success: false, error: error.message });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.id}`);
    });
  });
};

export default socketHandler; 