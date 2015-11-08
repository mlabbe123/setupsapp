var mongoose = require('mongoose');

var trackSchema = new mongoose.Schema({
    sim: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sim'
    },
    name: String,
    ac_code: {
        type: String,
        default: ''
    }
});

module.exports = mongoose.model('Track', trackSchema);