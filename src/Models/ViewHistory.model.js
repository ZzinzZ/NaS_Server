const mongoose = require("mongoose");
const { Schema } = mongoose;

const ViewHistorySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "Users", index: true },
    postId: { type: Schema.Types.ObjectId, ref: "Posts", index: true },
    viewedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

const ViewHistory = mongoose.model("ViewHistory", ViewHistorySchema);

module.exports = ViewHistory;
