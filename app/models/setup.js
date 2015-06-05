var mongoose = require('mongoose');

var setupSchema = new mongoose.Schema({
    author: String,
    type: String,
    car: String,
    track: String,
    sim_name: String
});

module.exports = mongoose.model('Setup', setupSchema);