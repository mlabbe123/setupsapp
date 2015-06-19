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
require('./app/routes.js')(app, passport);

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

var Sim = require('./app/models/sim');

// API route to retreive setups specific to a sim.
app.get('/api/get-setups/:simname', function(request, response) {

    Sim.findOne({'name': request.params.simname}, function(err, sim) {
        Setup.find({ 'sim': sim._id }).
            populate('author').
            populate('car').
            populate('track').
            populate('sim').
            exec(function(err, setups) {
                console.log(setups)
                if(err){
                    return console.log(err);
                } else {
                    return response.send(setups);
                }
            });
    });
});

// API route to retrieve every setups for the filters in setups listing page.
app.get('/api/get-setups-filters/:simname', function(request, response) {

    Sim.findOne({'name': request.params.simname}, function(err, sim) {
        Setup.find({ 'sim': sim._id }).
            populate('author').
            populate('car').
            populate('track').
            populate('sim').
            exec(function(err, setups) {
                console.log(setups)
                if(err){
                    return console.log(err);
                } else {
                    var setup_filters = {};

                    var car_filter = [];
                    var track_filter = [];
                    var author_filter = [];
                    var type_filter = [];

                    // Loop through every setup returned to build the filters arrays
                    _.forEach(setups, function(setup) {
                        car_filter.push(setup.car.name);
                        track_filter.push(setup.track.name);
                        author_filter.push(setup.author.display_name);
                        type_filter.push(setup['type']);
                    });

                    var type_filter_dict = [{'value': '', 'label': 'All'}];

                    _.forEach(_.uniq(type_filter), function(type) {
                        type_filter_dict.push({
                            'value': type,
                            'label': type
                        });
                    });

                    setup_filters.car_filters = _.uniq(car_filter);
                    setup_filters.track_filters = _.uniq(track_filter);
                    setup_filters.author_filters = _.uniq(author_filter);
                    setup_filters.type_filters = type_filter_dict;

                    return response.send(setup_filters);
                }
            });
    });
});

// API route to retreive every sims.
app.get('/api/get-all-sims/', function(request, response) {

    Sim.find(function(err, sims) {
        if(err){
            return console.log(err);
        } else {
            return response.send(sims);
        }
    });
});

// API route to retreive every cars.
app.get('/api/get-all-cars/', function(request, response) {

    Car.find(function(err, cars) {
        if(err){
            return console.log(err);
        } else {
            return response.send(cars);
        }
    });
});

// API route to retreive every tracks.
app.get('/api/get-all-tracks/', function(request, response) {

    Track.find(function(err, tracks) {
        if(err){
            return console.log(err);
        } else {
            return response.send(tracks);
        }
    });
});

// API route to retreive cars specific to a provided sim.
app.get('/api/get-cars-by-sim/:simid', function(request, response) {

    Car.find({'sim': request.params.simid}, function(err, cars) {
        if(err){
            return console.log(err);
        } else {
            console.log(cars)
            return response.send(cars);
        }
    });
});

var Sim = require('./app/models/sim');
// var newSim = new Sim({
//     name: 'iRacing'
// });
// newSim.save(function(err) {
//     if(err) {
//         console.log('error creating sim');
//     } else {
//         console.log('Sim successfuly created');
//     }
// });

// Insert new car for given sim (sim has to be a parameter)
// Sim.findOne({'name': 'Assetto Corsa'}, function(err, sim) {
//     var Car = require('./app/models/car');
//     var newCar = new Car({
//         sim: sim._id,
//         name: 'Ferrari F40',
//         category: ''
//     });
//     newCar.save(function(err) {
//         if(err) {
//             console.log('error creating car');
//         } else {
//             console.log('Car successfuly created');
//         }
//     });
// });

// Insert new track for given sim (sim has to be a parameter)
// Sim.findOne({'name': 'Assetto Corsa'}, function(err, sim) {
//     var Track = require('./app/models/track');
//     var newTrack = new Track({
//         sim: sim._id,
//         name: 'Mugello'
//     });
//     newTrack.save(function(err) {
//         if(err) {
//             console.log('error creating track');
//         } else {
//             console.log('Track successfuly created');
//         }
//     });
// });

var setup_params = {
    'authorId': '55773eb101263c024a78034f',
    'carId': '55773b1486089c2d496634bd',
    'trackId': '55773b83c45fd65d49cb426d',
    'simId': '5577366cdf073c6848e1eb98'
}

// Insert new setup for given user, car and track(must all be parameters)
var Setup = require('./app/models/setup');
var Car = require('./app/models/car');
var Track = require('./app/models/track');
var newSetup = new Setup({
    author: setup_params.authorId,
    car: setup_params.carId,
    track: setup_params.trackId,
    sim: setup_params.simId,
    type: 'qualy',
    best_time: '1.32.097',
    comments: 'Very fast and amazing setup'
});

// newSetup.save(function(err) {
//     if(err) {
//         console.log('error creating setup');
//     } else {
//         console.log('Setup successfuly created');
//     }
// });

// Setup.find({}).
//     populate('author').
//     populate('car').
//     populate('track').
//     populate('sim').
//     exec(function(err, setups) {
//         console.log(JSON.stringify(setups, null, "\t"))
//     });