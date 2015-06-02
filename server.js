var express = require('express'),
    app = express(),
    mongoose = require('mongoose'),
    passport = require('passport'),
    flash = require('connect-flash'),
    bodyParser = require('body-parser'),
    session = require('express-session');

// DB Config
mongoose.connect('mongodb://localhost/setups_app');

// Express config
app.use(express.static('builds/development'));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/builds/development/');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Passport config
require('./config/passport')(passport);

// Static dir config
var statidDir = "/Users/mathieu/projects/setupsapp/"

// Express session config
app.use(session({
    secret: "cookie_secret",
    name: "cookie_name",
    //store: sessionStore, // connect-mongo session store
    //proxy: true,
    resave: true,
    saveUninitialized: true
}));

// Passport config
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// Routes config
require('./app/routes.js')(app, passport, statidDir);

// Start the server
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

// var User = require('./app/models/user');
// var newUser = new User();
//         newUser.email = "mathieu.labbe@hotmail.com";
//         newUser.password = "#123";
//         newUser.display_name = "Chose";
//         newUser.nationality = "quebec";
//         newUser.join_date = "Un mmen dné";
//         newUser.save(function(err) {
//             if(err) {
//                 console.log('error creating user');
//             } else {
//                 console.log('user successfuly created');
//             }
//         });

// Sims API

// Tracks API

// Cars API

// Setups API