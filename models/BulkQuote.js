const mongoose = require('mongoose');

const bulkQuoteSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    organization: { type: String },
    count: { type: Number, required: true },
    requirements: { type: String, required: true },
    status: { type: String, default: 'new' },
    requestedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BulkQuote', bulkQuoteSchema);
