const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    // Lấy token từ header
    const token = req.headers['x-auth-token'];

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = user; 
        next();
    } catch (error) {
        console.error(`[ERROR] Msg: ${error.message}`);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token is expired' });
        } else {
            return res.status(401).json({ message: 'Token is not valid' });
        }
    }
};

module.exports = authMiddleware;
