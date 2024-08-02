const okResponse = (req, res, next) => {
    res.ok = (message, data) => {
        res.status(200).json({
            status: 'success',
            message: message,
            data: data
        });
    };

    res.created = (message, data) => {
        res.status(201).json({
            status: 'success',
            message: message,
            data: data
        });
    };

    next();
};

module.exports = okResponse;
