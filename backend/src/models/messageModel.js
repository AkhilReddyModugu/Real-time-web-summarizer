import mongoose from 'mongoose';

const messageSchema = mongoose.Schema(
  {
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true }, // Reference to the chat
    sender: { type: String, enum: ['user', 'model'], required: true }, // Sender type
    content: { type: String, required: true }, // Message content
    images: [{ type: String }], // Array to store image links
  },
  { timestamps: true }
);

const Message = mongoose.model('Message', messageSchema);

export default Message;
