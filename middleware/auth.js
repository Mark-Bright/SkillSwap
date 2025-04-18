const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        
        // Decode token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Set user in request - handle both possible token structures
        if (decoded.user) {
            req.user = decoded.user;
        } else if (decoded.id) {
            req.user = { id: decoded.id };
        } else {
            throw new Error('Invalid token structure');
        }

        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ message: 'Not authorized' });
    }
};

module.exports = auth; 