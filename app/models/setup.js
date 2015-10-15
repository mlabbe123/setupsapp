var mongoose = require('mongoose');

var setupSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    car: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car'
    },
    track: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Track'
    },
    sim: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sim'
    },
    sim_version: String,
    type: String,
    best_time: String,
    comments: String,
    file_name: String,
    added_date: {
        timestamp: Date,
        display_time: String
    },
    downloads: {
        type: Number,
        default: 0
    },
    ratings: [
        {
            userId: String,
            rating: Number
        }
    ],
    version: {
        type: Number,
        default: 1
    }
});

module.exports = mongoose.model('Setup', setupSchema);