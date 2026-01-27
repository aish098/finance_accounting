const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthController {
    async register(req, res) {
        try {
            const { username, password, role } = req.body;
            
            if (!username || !password) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Username and password are required',
                    message: 'Username and password are required',
                    payload: {} 
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Log for debugging
            console.log(`Attempting to register user: ${username}`);

            const [result] = await db.query(
                'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
                [username, hashedPassword, role || 'accountant']
            );
            
            console.log(`User registered successfully with ID: ${result.insertId}`);

            res.status(201).json({ 
                success: true,
                payload: {
                    id: result.insertId, 
                    username: username,
                    message: 'User registered successfully' 
                }
            });
        } catch (error) {
            console.error('Registration error:', error.message);
            // Return 'error' property so api.js can read it correctly
            res.status(500).json({ 
                success: false, 
                error: error.message,
                message: error.message,
                payload: {} 
            });
        }
    }

    async login(req, res) {
        try {
            const { username, password } = req.body;
            const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
            const user = rows[0];

            if (!user || !(await bcrypt.compare(password, user.password))) {
                return res.status(401).json({ 
                    success: false, 
                    error: 'Invalid username or password',
                    message: 'Invalid username or password',
                    payload: {}
                });
            }

            const token = jwt.sign(
                { id: user.id, username: user.username, role: user.role },
                process.env.JWT_SECRET || 'finance_accounting_secret_key_123',
                { expiresIn: '24h' }
            );

            res.json({ 
                success: true,
                payload: {
                    token, 
                    user: { id: user.id, username: user.username, role: user.role } 
                },
                token, // Compatibility with original frontend
                user: { id: user.id, username: user.username, role: user.role }
            });
        } catch (error) {
            console.error('Login error:', error.message);
            res.status(500).json({ 
                success: false, 
                error: error.message,
                message: error.message,
                payload: {}
            });
        }
    }
}

module.exports = new AuthController();
