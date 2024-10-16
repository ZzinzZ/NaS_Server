const mongoose = require("mongoose");
const { Schema } = mongoose;

const SearchHistorySchema = new Schema({
  keyword: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: "Users", required: true },
});

const SearchHistory = mongoose.model("SearchHistory", SearchHistorySchema);

module.exports = SearchHistory;