const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        // For simplicity in this demo, if no token is provided we'll allow it if it's a local request or skip for now
        // But to follow requirements, we should enforce it.
        // Let's implement it properly.
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (ex) {
        res.status(401).json({ error: 'Invalid or expired token.' });
    }
};
