const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

// Get all rooms
router.get('/', async (req, res) => {
    try {
        const rooms = await Room.find()
            .populate('createdBy', 'fullName profilePic')
            .populate('members', 'fullName profilePic');
        res.json(rooms);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a room
router.post('/create', async (req, res) => {
    const { name, description, type, userId } = req.body;
    
    const room = new Room({
        name,
        description,
        type,
        createdBy: userId,
        members: [userId]
    });

    try {
        let newRoom = await room.save();
        newRoom = await Room.findById(newRoom._id)
            .populate('createdBy', 'fullName profilePic')
            .populate('members', 'fullName profilePic');
        res.status(201).json(newRoom);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Join a room
router.post('/join', async (req, res) => {
    const { roomId, userId } = req.body;
    try {
        const room = await Room.findById(roomId);
        if (!room.members.includes(userId)) {
            room.members.push(userId);
            await room.save();
        }
        res.json(room);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
