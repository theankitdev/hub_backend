let io;

export const initSocket = (server) => {
  io = server;

  io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    // User joins their own room using their userId
    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined room`);
    });

    socket.on("disconnect", () => {
      console.log("User Disconnected:", socket.id);
    });
  });
};

export const getIO = () => {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
};