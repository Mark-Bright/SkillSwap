const User = require("./models/User");

const findMatches = async (userId) => {
    const user = await User.findById(userId);
    if (!user) return null;

    const matches = await User.find({
        skillsOffered: { $in: user.skillsWanted },
        skillsWanted: { $in: user.skillsOffered },
        location: user.location,
        _id: { $ne: userId }
    });

    return matches;
};

module.exports = findMatches;
