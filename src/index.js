/* global process */
'use strict';
const express = require("express");
const authRoute = require("./routes/auth");
const usersRoute = require("./routes/users");
const sequelize = require("./database/db");
const authenticateToken = require("./middleware/auth");
const app = express();
const PORT = process.env.PORT || 3000;
require('dotenv').config();

sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });


app.use(express.json());

app.get('/', (req, res) => res.send('Server is up!'))

app.use('/api/auth', authRoute)

// rest of the routes are protected
app.use(authenticateToken)
app.use('/api/users', usersRoute)

app.listen(PORT, ()=>{
    console.log(`Server is running at http://localhost:${PORT}`);
})
