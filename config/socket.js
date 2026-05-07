let io;

export const initSocket = (server) => {
  io = server;

  io.on("connection", (socket) => {
    console.log("User Connected", socket.id);

    socket.on("join", (userId) => {
      socket.join(userId);
    });

    socket.on("disconnect", () => {
      console.log("User Disconnected");
    });
  });
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }

  return io;
};