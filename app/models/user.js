var mongoose = require('mongoose'),
    bcrypt = require('bcrypt');

var userSchema = new mongoose.Schema({
    email: String,
    password: String,
    display_name: String,
    nationality: String,
    join_date: String,
    confirmed: {
        type: Boolean,
        default: false
    },
    admin: {
        type: Boolean,
        default: false
    },
    sci: String,
    disabled: Boolean
});

// Generate password hash.
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}

// Checking if password is valid.
userSchema.methods.isPasswordValid = function(password) {
    return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('User', userSchema);
