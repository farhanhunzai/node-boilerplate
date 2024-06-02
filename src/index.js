/* global process */
'use strict';
const express = require("express");
const authRoute = require("./routes/auth");
const usersRoute = require("./routes/users");
const sequelize = require("./database/db");
const authenticateToken = require("./middleware/auth");
const SocketManager = require("./SocketManager"); 
const cors = require('cors');
const authenticateSocket = require("./middleware/auth-socket");
const app = express();
const http = require('http').Server(app);
const PORT = process.env.PORT || 3000;
require('dotenv').config();

// Sequelize Database Connection
sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

app.use(cors());

// Express Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => res.send('Server is up!'))
app.use('/api/auth', authRoute)
app.use(authenticateToken)
app.use('/api/users', usersRoute)

// Initialize SocketManager
new SocketManager(http, authenticateSocket);

// Start the server

// Emit a message when the WebSocket server is ready
http.listen(PORT, () => {
  console.log(`HTTP server is ready and can be accessed via http://localhost:${PORT}`);
  console.log(`Socket server is ready and can be accessed via ws://localhost:${PORT}`);
});
