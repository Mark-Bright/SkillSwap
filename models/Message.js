const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, 'Sender is required']
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, 'Recipient is required']
    },
    content: {
        type: String,
        required: [true, 'Message content is required'],
        trim: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Add indexes for better query performance
MessageSchema.index({ sender: 1, recipient: 1 });
MessageSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Message", MessageSchema); 