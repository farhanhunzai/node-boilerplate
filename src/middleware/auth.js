/* global process */
'use strict';
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    // Get the token from the Authorization header
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1]; // Split the 'Bearer' prefix

    // If there's no token, respond with an error
    if (!token) return res.status(401).json({ error: 'Access Denied' });

    try {
        // Verify the token using the secret key
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verified; // Attach the verified user to the request
        next(); // Move to the next middleware or route handler
    } catch {
        // If the token is invalid, respond with an error
        res.status(400).json({ error: 'Invalid Token' });
    }
}

module.exports = authenticateToken;