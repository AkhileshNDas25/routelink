let ioInstance = null;
const activeUsers = new Map();

export const setIo = (io) => {
  ioInstance = io;
};

export const getIo = () => ioInstance;

export const addActiveUser = (userId, socketId) => {
  activeUsers.set(userId, socketId);
};

export const getSocketId = (userId) => activeUsers.get(userId);

export const removeActiveUserBySocketId = (socketId) => {
  for (const [userId, sId] of activeUsers.entries()) {
    if (sId === socketId) {
      activeUsers.delete(userId);
      return userId;
    }
  }
  return null;
};

export const listActiveUsers = () => Array.from(activeUsers.entries());
