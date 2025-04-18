const Message = require('../models/Message');
const User = require('../models/User');

// Send a message
exports.sendMessage = async (req, res) => {
    try {
        const { receiver, content } = req.body;

        // Create new message
        const message = new Message({
            sender: req.user.id,
            receiver,
            content
        });

        await message.save();

        // Populate sender and receiver details
        await message.populate('sender receiver', 'name email');

        res.status(201).json({
            status: 'success',
            data: { message }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while sending message'
        });
    }
};

// Get all conversations for the current user
exports.getConversations = async (req, res) => {
    try {
        // Get unique user IDs that the current user has chatted with
        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { sender: req.user.id },
                        { receiver: req.user.id }
                    ]
                }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ["$sender", req.user.id] },
                            "$receiver",
                            "$sender"
                        ]
                    },
                    lastMessage: { $last: "$$ROOT" },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                { $and: [
                                    { $eq: ["$receiver", req.user.id] },
                                    { $eq: ["$read", false] }
                                ]},
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: "$user"
            },
            {
                $project: {
                    _id: 0,
                    userId: "$_id",
                    userName: "$user.name",
                    userEmail: "$user.email",
                    lastMessage: 1,
                    unreadCount: 1,
                    lastMessageTime: "$lastMessage.createdAt"
                }
            },
            {
                $sort: { lastMessageTime: -1 }
            }
        ]);

        res.json({
            status: 'success',
            data: { conversations }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while fetching conversations'
        });
    }
};

// Get chat history with a specific user
exports.getChatHistory = async (req, res) => {
    try {
        const { userId } = req.params;

        // Get all messages between the current user and the specified user
        const messages = await Message.find({
            $or: [
                { sender: req.user.id, receiver: userId },
                { sender: userId, receiver: req.user.id }
            ]
        })
        .sort('createdAt')
        .populate('sender receiver', 'name email');

        // Mark messages as read
        await Message.updateMany(
            {
                sender: userId,
                receiver: req.user.id,
                read: false
            },
            { read: true }
        );

        res.json({
            status: 'success',
            data: { messages }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Server error while fetching chat history'
        });
    }
}; 