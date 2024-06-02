/* global process */
'use strict';
const loginValidator = require("../validator/login.validator");
const registerValidator = require('../validator/register.validator');
const { User } = require('../database/models'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthController {
    static async register(req, res) {
        const { error } = registerValidator(req.body);
        if(error) return res.status(400).send(error.details[0].message);
    
          // Check if the user already exists
        const emailExists = await User.findOne({ where: { email: req.body.email } });
        if (emailExists) return res.status(400).send('Email already exists');
    
        // Hash the password
        const saltRounds = process.env.SALT_ROUNDS;
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
    
        // Create a new user
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            salt: salt
        });
    
        try {
        const savedUser = await user.save();
        res.send({ user: savedUser.id });
        } catch (err) {
        res.status(400).send(err);
        }
    
    }

    static async login(req, res) {
        // Validate the data before logging in a user
        const { error } = loginValidator(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        // Check if the user exists
        const user = await User.findOne({ where: { email: req.body.email } });
        if (!user) return res.status(400).send('Email or password is wrong');

        // Check if the password is correct
        const validPass = await bcrypt.compare(req.body.password, user.password);
        if (!validPass) return res.status(400).send('Email or password is wrong');

        // Create and assign a token
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.TOKEN_SECRET, { expiresIn: '1h' });
        res.header('auth-token', token).send({ token: token });
    }
}

module.exports = AuthController;