/**
 * Socket.IO Server Management
 * Demonstrates room-based real-time communication and private notification routing
 */
export const initSocketEvents = (socket, io) => {
  // Join private personal room based on authenticated userId
  socket.on('FE_USER_JOIN_ROOM', (userId) => {
    if (userId) {
      socket.join(userId.toString())
    }
  })

  // Leave room
  socket.on('FE_USER_LEAVE_ROOM', (userId) => {
    if (userId) {
      socket.leave(userId.toString())
    }
  })

  // Broadcast example real-time event to a specific user room
  socket.on('FE_SEND_NOTIFICATION', (data) => {
    if (data?.recipientId) {
      socket.to(data.recipientId.toString()).emit('BE_RECEIVE_NOTIFICATION', data)
    }
  })

  // Broadcast to all clients
  socket.on('FE_BROADCAST_ALL', (payload) => {
    io.emit('BE_BROADCAST_ALL', payload)
  })
}

