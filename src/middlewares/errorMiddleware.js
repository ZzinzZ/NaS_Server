
const HttpException = require('../core/HttpException');

const errorMiddleware = (err, req, res, next) => {
  if (err instanceof HttpException) {
    res.status(err.status).json({ message: err.message });
  } else {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

module.exports = errorMiddleware;