var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var userSchema = new Schema({
    email: String,
    password: String,
    display_name: String,
    nationality: String,
    join_date: String
});

var User = mongoose.model('User', userSchema);

module.exports = {
  User: User
}
