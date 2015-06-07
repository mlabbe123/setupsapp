var express = require('express'),
    app = express(),
    mongoose = require('mongoose'),
    passport = require('passport'),
    flash = require('connect-flash'),
    bodyParser = require('body-parser'),
    session = require('express-session');

    _ = require('lodash');

// DB Config
mongoose.connect('mongodb://localhost/setups_app');

// Express config
app.use(express.static('builds/development'));
app.set('view engine', 'jade');
app.set('views', __dirname + '/frontend/templates/');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Passport config
require('./config/passport')(passport);

// Static dir config
var statidDir = "/Users/mathieu/web/setupsapp/"

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

var Setup = require('./app/models/setup');

// var newSetup = new Setup();
// newSetup.author = "mathieu@hotmail.com";
// newSetup.type = "qualy";
// newSetup.car = "Alfa Romeo 4C";
// newSetup.track = "Mugello";
// newSetup.sim_name = "ac";
// newSetup.save(function(err) {
//     if(err) {
//         console.log('error creating user');
//     } else {
//         console.log('setup successfuly created');
//     }
// });

// API route to retreive setups specific to a sim.
app.get('/api/get-setups/:simname', function(request, response) {
    console.log('Please get those setups for ' + request.params.simname)

    Setup.find({sim_name: request.params.simname}, function(err, setups) {
        if(err){
            return console.log(err);
        } else {
            return response.send(setups);
        }
    });
});

// API route to retrieve every setups for the filters in setups listing page.
app.get('/api/get-setups-filters/:simname', function(request, response) {
    console.log('Please get every setups, then return me a list of every unique documents row, to populate the filters');

    Setup.find({ sim_name: request.params.simname }, function(err, setups) {
        var setup_filters = {};

        if(err){
            return console.log(err);
        } else {
            var car_filter = [];
            var track_filter = [];
            var author_filter = [];
            var type_filter = ['all'];

            // Loop through every setup returned to build the filters arrays
            for(var i = 0; i < setups.length; i++) {  
                car_filter.push(setups[i].car);
                track_filter.push(setups[i].track);
                author_filter.push(setups[i].author);
                type_filter.push(setups[i]['type']);
            }

            // Remove every duplicates.
            car_filter = _.uniq(car_filter);
            track_filter = _.uniq(track_filter);
            author_filter = _.uniq(author_filter);
            type_filter = _.uniq(type_filter);

            // var car_filters_formatted = [];
            // var track_filters_formatted = [];
            // var author_filters_formatted = [];
            // var type_filters_formatted = [];

            // // Building objects in the format angular needs for ng-options.
            // for(var i = 0; i < car_filter.length; i++) {
            //     car_filters_formatted.push({
            //         'id': i,
            //         'label': car_filter[i]
            //     });

            //     track_filters_formatted.push({
            //         'id': i,
            //         'label': track_filter[i]
            //     });

            //     author_filters_formatted.push({
            //         'id': i,
            //         'label': author_filter[i]
            //     });

            //     type_filters_formatted.push({
            //         'id': i,
            //         'label': type_filter[i]
            //     });
            // }

            setup_filters.car_filters = car_filter;
            setup_filters.track_filters = track_filter;
            setup_filters.author_filters = author_filter;
            setup_filters.type_filters = type_filter;

            console.log(setup_filters)

            return response.send(setup_filters);
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