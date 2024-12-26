const mongoose = require("mongoose");

const { Schema } = mongoose;

const NotificationSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, index: true , ref:"Users"},
    message: { type: String, required: true },
    refChat: {type: Schema.Types.ObjectId, index: true, ref:"Chats"},
    refUser: {type: Schema.Types.ObjectId, ref:"Users"},
    type:{type: String, required: true},
    seen: { type: Boolean, default: false },
}, {
    timestamps: true
});

const Notification = mongoose.model("Notifications", NotificationSchema);
module.exports = Notification;