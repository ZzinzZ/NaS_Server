const jwt = require('jsonwebtoken');

const generateAccessToken = (userId) => {
    const payload = {
      jti: Math.random().toString(),
      iss: process.env.STRINGEE_API_SID_KEY,
      exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      userId: userId
    };
  
    return jwt.sign(payload, process.env.STRINGEE_API_SECRET_KEY, { algorithm: 'HS256' });
  };

const stringeeService = {
    genToken: ({userId}) => {
        const token = generateAccessToken(userId);
        return token;
    }
}

module.exports = stringeeService;