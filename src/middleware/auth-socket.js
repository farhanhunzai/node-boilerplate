/* global process */
'use strict';
const jwt = require('jsonwebtoken');

function authenticateSocket(socket, next) {
    // Extract token from the handshake query or headers
    const token = socket.handshake.query.token || socket.handshake.headers['authorization'];

    // If there's no token, deny access
    if (!token) {
        return next(new Error('Access Denied'));
    }

    try {
        // Verify the token using the secret key
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        socket.user = verified; // Attach the verified user to the socket object
        next(null, verified); // Move to the next middleware or socket event handler
    } catch (err) {
        // If the token is invalid, deny access
        next(new Error(err));
    }
}

module.exports = authenticateSocket;
