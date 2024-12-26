const stringeeService = require("../Services/stringee.service");
const { SYS_MESSAGE } = require("../core/configs/systemMessage");

const stringeeController = {
    genToken: (req, res, next) => {
        try {
            const {userId} = req.params;
            const token = stringeeService.genToken({userId});
            res.ok(SYS_MESSAGE.SUCCESS, token);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = stringeeController;