const { SYS_MESSAGE } = require("../core/configs/systemMessage");
const HttpException = require("../core/HttpException");
const SearchHistory = require("../Models/SearchHistory.model")

const searchHistoryService = {
    deleteSearchHistory: async ({searchId}) => {
        try {
            const search = await SearchHistory.findOne({_id: searchId});
            if (!search) {
                throw new HttpException(404, SYS_MESSAGE.NOT_FOUND);
            }
            await SearchHistory.deleteOne({_id: searchId});
            return true;
        } catch (error) {
            throw new HttpException(error.status || 500, error.message || error);
        }
    },
    getSearchHistoryByUserId: async ({userId}) => {
        try {
            const searches = await SearchHistory.find({userId: userId}).sort({date: -1});
            if (!searches) {
                throw new HttpException(404, SYS_MESSAGE.NOT_FOUND);
            }
            return searches;
        } catch (error) {
            throw new HttpException(error.status || 500, error.message || error);
        }
    }
}

module.exports = searchHistoryService;