const User = require('../models/User');

// Get User Profile by username
exports.getUserProfile = async (req, res) => {
    const { username } = req.params;
    try {
        const user = await User.findOne({ username })
            .select('-password')
            .populate('followers', 'fullName username profilePic')
            .populate('following', 'fullName username profilePic');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get User by ID
exports.getUserById = async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findById(userId)
            .select('-password')
            .populate('followers', 'fullName username profilePic')
            .populate('following', 'fullName username profilePic');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update User Profile
exports.updateProfile = async (req, res) => {
    const { userId } = req.params;
    const { fullName, bio, location, profilePic, coverPic } = req.body;

    // Security check: only allow users to update their own profile
    if (req.user._id.toString() !== userId) {
        return res.status(403).json({ message: 'Not authorized to update this profile.' });
    }

    try {
        const user = await User.findByIdAndUpdate(
            userId,
            { fullName, bio, location, profilePic, coverPic },
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
