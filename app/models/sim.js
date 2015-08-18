var mongoose = require('mongoose');

var simSchema = new mongoose.Schema({
    display_name: String,
    code: String,
    versions: []
});

module.exports = mongoose.model('Sim', simSchema);