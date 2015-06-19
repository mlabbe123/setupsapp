var mongoose = require('mongoose');

var simSchema = new mongoose.Schema({
    name: String
});

module.exports = mongoose.model('Sim', simSchema);