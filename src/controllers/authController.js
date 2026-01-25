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
                    message: 'Username and password are required' 
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const [result] = await db.query(
                'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
                [username, hashedPassword, role || 'accountant']
            );
            
            res.status(201).json({ 
                success: true,
                payload: {
                    id: result.insertId, 
                    username: username,
                    message: 'User registered successfully' 
                }
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ 
                success: false, 
                message: error.message 
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
                    message: 'Invalid username or password' 
                });
            }

            const token = jwt.sign(
                { id: user.id, username: user.username, role: user.role },
                process.env.JWT_SECRET || 'secret',
                { expiresIn: '24h' }
            );

            res.json({ 
                success: true,
                payload: {
                    token, 
                    user: { id: user.id, username: user.username, role: user.role } 
                },
                // Keep the original format as well for compatibility
                token,
                user: { id: user.id, username: user.username, role: user.role }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ 
                success: false, 
                message: error.message 
            });
        }
    }
}

module.exports = new AuthController();
