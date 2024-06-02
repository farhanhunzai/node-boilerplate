const { User } = require('../database/models'); 

class UserController {
    static async list(req, res) {
        try {
            // Retrieve all users from the database, excluding sensitive fields
            const users = await User.findAll({
                attributes: { exclude: ['password', 'salt'] }
            });
            
            // Send the list of users as the response
            res.json(users);
        } catch (err) {
            // Handle any errors that occur during the database query
            res.status(500).json({ error: 'An error occurred while fetching users.' });
        }
    }
}

module.exports = UserController;