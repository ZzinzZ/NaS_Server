const mongoose = require('mongoose');

const { Schema } = mongoose;

const UsersSchema = new Schema({
  status: { type: Boolean },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true},
});

const User = mongoose.model('Users', UsersSchema);

module.exports = User;

