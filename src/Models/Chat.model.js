const mongoose = require("mongoose");

const { Schema } = mongoose;

const ChatsSchema = new Schema(
  {
    type: { type: String, enum: ["private", "group"] },
    created_by: { type: Schema.Types.ObjectId },
    participants: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "Users" },
      },
    ],
    background: { type: String },
    avatar: { type: String },
    chat_name: { type: String },
    last_message: {
      messId: { type: Schema.Types.ObjectId, ref: "Messages" },
      senderId: { type: Schema.Types.ObjectId, ref: "Users" },
    },
  },
  { timestamps: true }
);

const Chats = mongoose.model("Chats", ChatsSchema);

module.exports = Chats;
