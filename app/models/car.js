var mongoose = require('mongoose');

var carSchema = new mongoose.Schema({
    sim: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sim'
    },
    name: String,
    category: String
});

module.exports = mongoose.model('Car', carSchema);