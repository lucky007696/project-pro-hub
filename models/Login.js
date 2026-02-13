const mongoose = require('mongoose');

const loginSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    email: String,
    ip: String,
    loggedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Login', loginSchema);
