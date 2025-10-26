const logger = require('../utils/logger');

let io;

const initSocketIO = (socketIO) => {
  io = socketIO;

  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    socket.on('join-dashboard', (data) => {
      socket.join('dashboard');
      logger.info(`Client ${socket.id} joined dashboard room`);
    });

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });
};

const emitToAll = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

const emitToDashboard = (event, data) => {
  if (io) {
    io.to('dashboard').emit(event, data);
  }
};

const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user-${userId}`).emit(event, data);
  }
};

module.exports = {
  initSocketIO,
  emitToAll,
  emitToDashboard,
  emitToUser
};
