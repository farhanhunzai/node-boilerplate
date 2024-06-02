const socketIO = require('socket.io');
const MessageQueue = require('./message-queue/mongo-message-queue');

class SocketManager {
  constructor(server, authenticateSocket) {
    this.io = socketIO(server);
    this.authenticateSocket = authenticateSocket;
    this.connectedClients = new Map(); // Changed to use Map for disbursement ID to socket ID mapping

    this.io.origins('*:*'); // Allow connections from any origin

    this.io.on('connection', (socket) => {
      console.log('A user connected',  this.connectedClients.size);
      // Pass the token to the authenticateSocket middleware
      this.authenticateSocket(socket, (error, user) => {
        if (error) {
          console.log('Authentication failed:', error);
          socket.disconnect(true);
        } else {
          console.log('User authenticated:', user);
          if (user.disbursementId) {
            this.connectedClients.set(user.disbursementId, socket.id);
            console.log(`Mapped disbursement ID ${user.disbursementId} to socket ID ${socket.id}`);
          }
        }
      });

      socket.on('disconnect', () => {
        console.log('User disconnected');
        // Remove the mapping for the disconnected socket
        for (const [disbursementId, socketId] of this.connectedClients.entries()) {
          if (socketId === socket.id) {
            this.connectedClients.delete(disbursementId);
            console.log(`Removed mapping for disbursement ID ${disbursementId}`);
            break;
          }
        }
        console.log('Number of clients connected:', this.connectedClients.size);
      });
    });

    // Subscribe to the messaging queue for updates
    this.setupMessageQueue();
  }

  async setupMessageQueue() {
    try {
      const messageQueue = new MessageQueue('mongodb+srv://sefarhankhan200:A7ZFRqvXzDKgzE2b@messaging-queue.8io4ou5.mongodb.net/?retryWrites=true&w=majority&appName=messaging-queue', 'messagingqueue', 'messages');
      await messageQueue.connect();

      // Listen for payment updates
      await messageQueue.listen((message) => {
        // Check if the message contains a disbursement ID
        if (message.disbursementId) {
          const socketId = this.connectedClients.get(message.disbursementId);
          if (socketId) {
            // Emit the update only to the specific socket associated with the disbursement ID
            this.io.to(socketId).emit('transaction_update', message);
            console.log(`Emitted transaction update to socket ID ${socketId}`);
          } else {
            console.log(`No socket found for disbursement ID ${message.disbursementId}`);
          }
        } else {
          console.log('Message does not contain a disbursement ID');
        }
      });
    } catch (error) {
      console.error('Error setting up message queue:', error);
    }
  }
}

module.exports = SocketManager;
