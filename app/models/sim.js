var mongoose = require('mongoose');

var simSchema = new mongoose.Schema({
    display_name: String,
    code: String
});

module.exports = mongoose.model('Sim', simSchema);