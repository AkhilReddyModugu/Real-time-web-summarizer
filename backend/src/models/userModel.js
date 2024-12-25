import mongoose from 'mongoose';

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    chats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }], // List of chats for the user
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
