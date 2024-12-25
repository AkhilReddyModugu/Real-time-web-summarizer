import mongoose from 'mongoose';

const chatSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Chat belongs to a user
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }], // List of messages
  },
  { timestamps: true }
);

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;