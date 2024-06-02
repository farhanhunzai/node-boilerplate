const  UserController  = require('../../src/controllers/user.controller');
const usersRoute = require('express').Router();


usersRoute.get('/list', (req, res) => UserController.list(req, res));

module.exports = usersRoute;