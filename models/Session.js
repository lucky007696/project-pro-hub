const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    sessionType: { type: String, required: true },
    sessionMessage: { type: String, required: true },
    status: { type: String, default: 'pending', enum: ['pending', 'confirmed', 'completed', 'cancelled'] },
    bookedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date }
});

module.exports = mongoose.model('Session', sessionSchema);
