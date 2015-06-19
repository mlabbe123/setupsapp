var mongoose = require('mongoose');

var trackSchema = new mongoose.Schema({
    sim: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sim'
    },
    name: String
});

module.exports = mongoose.model('Track', trackSchema);