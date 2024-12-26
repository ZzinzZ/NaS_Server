const { SYS_MESSAGE } = require("../core/configs/systemMessage");
const HttpException = require("../core/HttpException");
const SearchHistory = require("../Models/SearchHistory.model");

const searchHistoryService = {
  deleteSearchHistory: async ({ searchId }) => {
    const search = await SearchHistory.findOne({ _id: searchId });
    if (!search) {
      throw new HttpException(404, SYS_MESSAGE.NOT_FOUND);
    }
    await SearchHistory.deleteOne({ _id: searchId });
    return true;
  },
  getSearchHistoryByUserId: async ({ userId }) => {
    const searches = await SearchHistory.find({ userId: userId }).sort({
      date: -1,
    });
    if (!searches) {
      throw new HttpException(404, SYS_MESSAGE.NOT_FOUND);
    }
    return searches;
  },
};

module.exports = searchHistoryService;
