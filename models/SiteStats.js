const mongoose = require('mongoose');

const SiteSchema = new mongoose.Schema({
    totalVisits: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('SiteStats', SiteSchema);
