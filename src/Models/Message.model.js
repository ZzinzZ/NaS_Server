const mongoose = require("mongoose");

const { Schema } = mongoose;

const MessagesSchema = new Schema(
  {
    reply_to: { type: Schema.Types.ObjectId, ref: "Messages" },
    sender_id: { type: Schema.Types.ObjectId, ref: "Users" },
    content: {
      file: [
        {
          fileName: { type: String, required: true },
          filePath: { type: String, required: true },
          fileSize: { type: Number, required: true },
          fileType: { type: String },
        },
      ],
      image: [{ type: String }],
      text: { type: String },
      call: {
        callDuration: { type: Number },
        is_accepted: { type: Boolean },
        is_rejected: { type: Boolean },
        call_type: { type: String, enum: ["audio", "video"]},
      },
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
