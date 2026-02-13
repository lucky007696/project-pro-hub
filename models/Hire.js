const mongoose = require('mongoose');

const hireSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, default: 'new' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Hire', hireSchema);
