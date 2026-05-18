const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: {
        type: String,
        sparse: true,
        unique: true,
        lowercase: true,
        trim: true,
        default: undefined,
    },
    phone: {
        type: String,
        sparse: true,
        unique: true,
        trim: true,
        default: undefined,
    },
    password: { type: String, required: true },
    fullName: { type: String, required: true, trim: true },
    profilePic: { type: String, default: '' },
    coverPic: { type: String, default: '' },
    bio: { type: String, default: '' },
    location: { type: String, default: '' },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    resetOTP: { type: String },
    resetOTPExpires: { type: Date },
    notificationSettings: {
        push: { type: Boolean, default: true },
        messages: { type: Boolean, default: true },
        activity: { type: Boolean, default: true }
    }
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password helper
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
