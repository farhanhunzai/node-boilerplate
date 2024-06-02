const  AuthController  = require('../../src/controllers/auth.controller');
const authRoute = require('express').Router();


authRoute.post('/register', (req, res) => AuthController.register(req, res));
authRoute.post('/login', (req, res) => AuthController.login(req, res));

module.exports = authRoute;