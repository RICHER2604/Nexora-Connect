const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/emailService');

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const buildUserResponse = (user) => ({
    _id: user._id,
    fullName: user.fullName,
    username: user.username,
    email: user.email || null,
    phone: user.phone || null,
    profilePic: user.profilePic,
    coverPic: user.coverPic,
    bio: user.bio,
    location: user.location,
    followers: user.followers,
    following: user.following,
    createdAt: user.createdAt,
});

// @POST /api/auth/register
const register = async (req, res) => {
    try {
        const { fullName, username, emailOrPhone, password } = req.body;

        if (!fullName || !username || !emailOrPhone || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters.' });
        }

        const isEmail = emailOrPhone.includes('@');

        // Check for existing username
        const existingUsername = await User.findOne({ username: username.trim() });
        if (existingUsername) {
            return res.status(400).json({ message: 'Username already taken.' });
        }

        // Check for existing email/phone
        if (isEmail) {
            const existingEmail = await User.findOne({ email: emailOrPhone.toLowerCase().trim() });
            if (existingEmail) {
                return res.status(400).json({ message: 'This email is already registered.' });
            }
        } else {
            const existingPhone = await User.findOne({ phone: emailOrPhone.trim() });
            if (existingPhone) {
                return res.status(400).json({ message: 'This phone number is already registered.' });
            }
        }

        // Build user object — only set email OR phone, not both
        const userData = {
            fullName: fullName.trim(),
            username: username.trim(),
            password, // will be hashed by pre-save hook
        };
        if (isEmail) {
            userData.email = emailOrPhone.toLowerCase().trim();
        } else {
            userData.phone = emailOrPhone.trim();
        }

        const user = await User.create(userData);
        const token = generateToken(user._id);

        return res.status(201).json({ token, user: buildUserResponse(user) });
    } catch (err) {
        console.error('Register error:', err);
        // Handle Mongoose duplicate key error
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            return res.status(400).json({ message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.` });
        }
        // Handle Mongoose validation errors
        if (err.name === 'ValidationError') {
            const message = Object.values(err.errors).map(val => val.message).join(', ');
            return res.status(400).json({ message });
        }
        return res.status(500).json({ message: 'Server error during registration.', detail: err.message });
    }
};

// @POST /api/auth/login
const login = async (req, res) => {
    try {
        const { emailOrPhone, password } = req.body;

        if (!emailOrPhone || !password) {
            return res.status(400).json({ message: 'Please provide your email/phone and password.' });
        }

        const isEmail = emailOrPhone.includes('@');
        const query = isEmail
            ? { email: emailOrPhone.toLowerCase().trim() }
            : { phone: emailOrPhone.trim() };

        const user = await User.findOne(query);
        if (!user) {
            return res.status(401).json({ message: 'No account found with these credentials.' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect password. Please try again.' });
        }

        const token = generateToken(user._id);
        return res.status(200).json({ token, user: buildUserResponse(user) });
    } catch (err) {
        console.error('Login error:', err.message);
        return res.status(500).json({ message: 'Server error during login.', detail: err.message });
    }
};

// @GET /api/auth/me  (protected)
const getMe = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ message: 'Not authorized.' });
        const user = await User.findById(req.user._id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found.' });
        return res.json(buildUserResponse(user));
    } catch (err) {
        console.error('getMe error:', err.message);
        return res.status(500).json({ message: 'Server error.', detail: err.message });
    }
};

// @POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(404).json({ message: 'No user found with this email address.' });
        }

        // Generate a random 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Save to DB with 10 min expiry
        user.resetOTP = otp;
        user.resetOTPExpires = Date.now() + 10 * 60 * 1000;
        await user.save();

        // Send Email
        try {
            // Check if email credentials are set to placeholders
            const isPlaceholder = !process.env.EMAIL_USER || process.env.EMAIL_USER.includes('example.com') || process.env.EMAIL_USER === 'your_email@example.com';
            
            if (isPlaceholder) {
                console.warn('⚠️ SMTP credentials are placeholders. Skipping email and returning OTP in response for testing.');
                return res.status(200).json({ 
                    message: 'OTP sent to email (Placeholder Mode: OTP returned for testing).', 
                    testOTP: otp // ONLY FOR TESTING
                });
            }

            await sendEmail({
                email: user.email,
                subject: 'Your Password Reset OTP - Nexora Connect',
                message: `Your OTP for password reset is: ${otp}. It expires in 10 minutes.`,
                html: `
                    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #4f46e5;">Nexora Connect</h2>
                        <p>You requested a password reset. Use the code below to proceed:</p>
                        <div style="font-size: 32px; font-weight: bold; color: #4f46e5; margin: 20px 0; letter-spacing: 5px;">${otp}</div>
                        <p style="color: #666; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
                    </div>
                `
            });
            res.status(200).json({ message: 'OTP sent to email.' });
        } catch (emailErr) {
            console.error('Email send error:', emailErr.message);
            
            // If email fails, we still return 200 in development if we want to allow testing
            if (process.env.NODE_ENV !== 'production') {
                 return res.status(200).json({ 
                    message: 'Email failed to send, but here is your OTP (Dev Mode):', 
                    testOTP: otp 
                });
            }

            user.resetOTP = undefined;
            user.resetOTPExpires = undefined;
            await user.save();
            return res.status(500).json({ message: 'Failed to send email. Please check your SMTP settings in .env.' });
        }

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @POST /api/auth/verify-otp
const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ 
            email: email.toLowerCase().trim(),
            resetOTP: otp,
            resetOTPExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }

        res.status(200).json({ message: 'OTP verified successfully.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @POST /api/auth/reset-password
const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const user = await User.findOne({ 
            email: email.toLowerCase().trim(),
            resetOTP: otp,
            resetOTPExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired session. Please start over.' });
        }

        // Set new password
        user.password = newPassword; // Will be hashed by pre-save hook
        user.resetOTP = undefined;
        user.resetOTPExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successful. You can now login.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { register, login, getMe, forgotPassword, verifyOTP, resetPassword };
