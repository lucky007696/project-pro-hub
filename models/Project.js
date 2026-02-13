const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, required: true, enum: ['ai', 'web', 'chatbot', 'iot', 'mobile', 'research', 'security'] },
    image: { type: String, required: true },
    description: { type: String, required: true },
    tags: [{ type: String }], // e.g. ['Medical AI', 'Healthcare']
    link: { type: String, default: '#contact' },
    badge: { type: String }, // e.g. 'Top Featured', 'Best Seller'
    featured: { type: Boolean, default: false },
    priority: { type: Number, default: 0 }, // Higher number = higher display priority
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);
