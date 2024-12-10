const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    twitchUsername: { type: String, required: true },
    twitchToken: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
