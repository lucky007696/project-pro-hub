const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    level: { type: String, required: true, enum: ['beginner', 'intermediate', 'advanced'] },
    description: { type: String, required: true },
    duration: { type: String, required: true }, // e.g. '3 weeks'
    features: [{ type: String }], // List of what they'll build
    sessionType: { type: String, default: 'training-demo' },
    badge: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Course', courseSchema);
