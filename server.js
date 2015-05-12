var express = require('express'),
    app = express(),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/setups_app');

app.use(express.static('builds/development'));

var server = app.listen(3000, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});

require('./models/user.js');

var User = require('./models/user').User;

var dummyuser1 = new User({
    email: 'm@m.lab',
    password: 'pass',
    display_name: 'IamM',
    nationality: 'Canada',
    join_date: '2015/05/10'
});

dummyuser1.save(function (err) {
  if (err) return handleError(err);
  // saved!
});

User.find(function(err, user){
    console.log(user)
});

// USERS API
app.get('/api/users', function(request, response) {
    User.find(function(err, users) {
        if(err){
            return console.log(err);
        } else {
            return response.send(users);
        }
    });
});

// Sims API

// Tracks API

// Cars API

// Setups API