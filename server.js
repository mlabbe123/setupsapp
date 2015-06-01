var express = require('express'),
    app = express(),
    mongoose = require('mongoose'),
    passport = require('passport'),
    flash = require('connect-flash'),

    session = require('express-session');

// DB Config
mongoose.connect('mongodb://localhost/setups_app');

// Express config
app.use(express.static('builds/development'));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/builds/development/');

// Passport config
require('./config/passport')(passport);

app.use(session({
    secret: "cookie_secret",
    name: "cookie_name",
    //store: sessionStore, // connect-mongo session store
    //proxy: true,
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// Routes config
require('./app/routes.js')(app, passport);

var server = app.listen(3000, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
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