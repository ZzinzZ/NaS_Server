const mongoose = require('mongoose');

const { Schema } = mongoose;

const UsersSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true},
  status: { type: Boolean, required: true}
},
{
  timestamps: true,
}
);

const User = mongoose.model('Users', UsersSchema);

module.exports = User;

