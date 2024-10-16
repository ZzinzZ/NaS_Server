const { SYS_MESSAGE } = require("../core/configs/systemMessage");
const searchHistoryService = require("../Services/SearchHistory.service");

const searchHistoryController = {
    deleteSearchHistory: async (req, res, next) => {
        try {
            const { searchId } = req.params;
            const result = await searchHistoryService.deleteSearchHistory({searchId});
            res.ok(SYS_MESSAGE.SUCCESS, result)
        } catch (error) {
            next(error);
        }
    },
    getSearchByUserId: async (req, res, next) => {
        try {
            const { userId } = req.params;
            const result = await searchHistoryService.getSearchHistoryByUserId({userId});
            res.ok(SYS_MESSAGE.SUCCESS, result)
        } catch (error) {
            next(error);
        }
    },
}

module.exports = searchHistoryController;