const mongoose = require("mongoose");

const { Schema } = mongoose;

const MessagesSchema = new Schema(
  {
    reply_to: { type: Schema.Types.ObjectId, ref: "Messages" },
    sender_id: { type: Schema.Types.ObjectId, ref: "Users" },
    content: {
      file: [
        {
          fileName: { type: String, required: true }, // Tên file
          filePath: { type: String, required: true }, // URL để tải file
          fileSize: { type: Number, required: true }, // Kích thước file
        },
      ],
      image: [{ type: String }],
      text: { type: String },
    },
    chat_id: { type: Schema.Types.ObjectId },
    react: [
      {
        emotion: { type: String },
        userId: { type: Schema.Types.ObjectId, ref: "Users" },
      },
    ],
    status: {
      seen_by: [{ type: Schema.Types.ObjectId }],
    },
    is_deleted_by: [
      {
        userId: { type: Schema.Types.ObjectId },
        _id: false,
      },
    ],
    isRemoved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Messages = mongoose.model("Messages", MessagesSchema);

module.exports = Messages;
