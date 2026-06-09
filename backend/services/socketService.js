let io = null;
const userSockets = new Map();

const initializeSocket = (server, corsOptions) => {
  const { Server } = require("socket.io");

  io = new Server(server, {
    cors: corsOptions,
  });

  io.on("connection", (socket) => {
    socket.on("register", (userId) => {
      if (!userId) return;
      const key = String(userId);
      socket.data.userId = key;

      if (!userSockets.has(key)) {
        userSockets.set(key, new Set());
      }
      userSockets.get(key).add(socket.id);
    });

    socket.on("disconnect", () => {
      const key = socket.data.userId;
      if (!key || !userSockets.has(key)) return;

      const sockets = userSockets.get(key);
      sockets.delete(socket.id);
      if (sockets.size === 0) {
        userSockets.delete(key);
      }
    });
  });

  return io;
};

const sendNotificationToUser = (userId, notification) => {
  if (!io || !userId) return;

  const sockets = userSockets.get(String(userId));
  if (!sockets) return;

  sockets.forEach((socketId) => {
    io.to(socketId).emit("notification", notification);
  });
};

module.exports = {
  initializeSocket,
  sendNotificationToUser,
};
