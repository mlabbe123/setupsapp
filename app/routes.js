module.exports = function(app, passport) {
    var fs = require('fs'),
        path = require('path'),

        Sim = require('./models/sim'),
        User = require('./models/user'),
        Car = require('./models/car'),
        Track = require('./models/track'),
        Setup = require('./models/setup');


    // ===========================
    // GET requests
    // ===========================

    // Home page
    app.get('/', function(request, response) {
        response.render('index', {
            user: request.user
        });
    });

    // Login page
    app.get('/login', function(request, response) {
        response.render('login', {
            message: request.flash('loginMessage')
        });
    });

    // Register page
    app.get('/register', function(request, response) {
        response.render('register', {
            message: request.flash('registerMessage')
        });
    });

    // Submit setup page
    app.get('/submit-setup', isUserLoggedIn, function(request, response) {
        response.render('submit', {
            user: request.user,
            message: request.flash('submitSetupMessage')
        });
    });

    // Profile page.
    app.get('/profile', isUserLoggedIn, function(request, response) {
        console.log(request)
        response.render('profile', {
            user: request.user
        });
    });

    // Download setups.
    app.get('/setup_files/:simid/:filename', function(request, response) {
        var file = './setups_files/' + request.params.simid + '/' + request.params.filename;
        response.download(file);
    });

    // Logout route.
    app.get('/logout', function(request, response) {
        request.logout();
        response.redirect('/');
    });

    // Admin section page.
    app.get('/admin', isUserLoggedInAndAdmin, function(request, response) {
        response.render('admin', {
            user: request.user
        });
    });


    // ===========================
    // POST requests
    // ===========================

    // Register form submission.
    app.post('/register', passport.authenticate('local-register', {
        successRedirect: '/#/profile/', // redirect to the secure profile section
        failureRedirect: '/register', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // Login form submission.
    app.post('/login', passport.authenticate('local-login', {
        //successRedirect: '/#/profile/', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }), function(request, response) {
        response.redirect('/#/profile/' + response.req.user._id)
    });

    // Setup form submission.
    app.post('/submit-setup', isUserLoggedIn, function(request, response) {

        if(request.files.setup_file === undefined) {
            response.render('submit', {
                user: request.user,
                message: 'Please attach a valid setup file.'
            });
        } else {

            var newSetup = new Setup({
                author: request.body.user_id,
                sim: request.body.sim,
                car: request.body.car,
                track: request.body.track,
                type: request.body.trim,
                best_time: request.body.best_time,
                comments: request.body.comments,
                file_name: request.files.setup_file.originalname
            });

            newSetup.save(function(err) {
                if(err) {
                    console.log('Error creating setup.')
                } else {
                    console.log('Setup successfuly created.')
                }
            });

            // Upload of the file.
            if(done==true){
                response.render('submit', {
                    user: request.user,
                    message: 'Setup successfully uploaded'
                });
            }
        }
    });


    // ==============================
    // API SECTION
    // ==============================

    // Retrieve sim infos for specific sim.
    app.get('/api/get-sim-infos/:simname', function(request, response) {
        Sim.findOne({'display_name': request.params.simname}, function(err, sim) {
            if(err){
                return console.log(err);
            } else {
                return response.send(sim);
            }
        });
    });

    // Retreive every sims.
    app.get('/api/get-all-sims/', function(request, response) {

        Sim.find(function(err, sims) {
            if(err){
                return console.log(err);
            } else {
                return response.send(sims);
            }
        });
    });

    // Retrieve every users.
    app.get('/api/get-all-users/', function(request, response) {
        User.find(function(err, users) {
            if(err){
                return console.log(err);
            } else {
                return response.send(users);
            }
        });
    });

    // Retrieve user by id.
    app.get('/api/get-user-by-id/:userid', function(request, response) {
        User.findOne({_id: request.params.userid}, function(err, user) {
            if(err){
                return console.log(err);
            } else {
                return response.send(user);
            }
        });
    });

    // Retrieve user by display_name.
    app.get('/api/get-user-by-name/:username', function(request, response) {
        User.findOne({'display_name': request.params.username}, function(err, user) {
            if(err){
                return console.log(err);
            } else {
                return response.send(user);
            }
        });
    });

    // Retrieve every users display_name.
    app.get('/api/get-all-user-displayname', function(request, response) {
        User.find({}, {_id:0, display_name:1}, function(err, users) {
            if(err){
                return console.log(err);
            } else {
                console.log(users);
                return response.send(users);
            }
        });
    });

    // Retreive setups specific to a sim.
    app.get('/api/get-setups/:simname', function(request, response) {

        Sim.findOne({'display_name': request.params.simname}, function(err, sim) {
            Setup.find({ 'sim': sim._id }).
                populate('author').
                populate('car').
                populate('track').
                populate('sim').
                exec(function(err, setups) {
                    if(err){
                        return console.log(err);
                    } else {
                        return response.send(setups);
                    }
                });
        });
    });

    // Retreive setup file details.
    app.get('/api/get-setup-file-details/:setupid', function(request, response) {

        Setup.findOne({'_id': request.params.setupid}, {_id:0, sim:1, file_name:1}).
            populate('sim').
            exec(function(err, setup) {
                if(err){
                    return console.log(err);
                } else {
                    // Read the file.
                    console.log(setup);

                    fs.readFile(path.join(__dirname, '../setups_files/', setup.sim._id.toString(), '/', setup.file_name), 'utf8', function (err,data) {
                        if (err) {
                            return console.log(err);
                        }

                        return response.send(data);
                    });
                }
            });
    });

    // Retrieve every setups for the filters in setups listing page.
    app.get('/api/get-setups-filters/:simname', function(request, response) {

        Sim.findOne({'display_name': request.params.simname}, function(err, sim) {
            Setup.find({ 'sim': sim._id }).
                populate('author').
                populate('car').
                populate('track').
                populate('sim').
                exec(function(err, setups) {
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

                        // var type_filter_dict = [{'value': '', 'label': 'All'}];

                        // _.forEach(_.uniq(type_filter), function(type) {
                        //     type_filter_dict.push({
                        //         'value': type,
                        //         'label': type
                        //     });
                        // });

                        setup_filters.car_filters = _.uniq(car_filter);
                        setup_filters.track_filters = _.uniq(track_filter);
                        setup_filters.author_filters = _.uniq(author_filter);
                        setup_filters.type_filters = _.uniq(type_filter);

                        return response.send(setup_filters);
                    }
                });
        });
    });

    // Retrieve setup by Id.
    app.get('/api/get-setup/:setupid', function(request, response) {

        Setup.findOne({'_id': request.params.setupid}).
            populate('author').
            populate('sim').
            populate('car').
            populate('track').
            exec(function(err, setup) {
                if(err) {
                    return console.log(err);
                } else {
                    return response.send(setup);
                }
            });
    });

    // Retrieve setups by userid.
    app.get('/api/get-setups-by-user/:userid', function(request, response) {

        Setup.find({'author': request.params.userid}).
            populate('author').
            populate('sim').
            populate('car').
            populate('track').
            exec(function(err, setups) {
                if(err) {
                    return console.log(err);
                } else {
                    console.log(setups)
                    return response.send(setups);
                }
            });
    });

    // Retreive every cars.
    app.get('/api/get-all-cars/', function(request, response) {

        Car.find()
            .populate('sim')
            .exec(function(err, cars) {
                if(err){
                    return console.log(err);
                } else {
                    return response.send(cars);
                }
            });
    });

    // Retreive cars specific to a provided sim.
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

    // Retreive every tracks.
    app.get('/api/get-all-tracks/', function(request, response) {

        Track.find()
            .populate('sim')
            .exec(function(err, tracks) {
                if(err){
                    return console.log(err);
                } else {
                    return response.send(tracks);
                }
            });
    });

    // Add new sim.
    app.post('/api/add-sim/', function(request, response) {
        var newSim = new Sim({
            display_name: request.body.simCode,
            code: request.body.simDisplayName
        });

        newSim.save(function(err) {
            if(err) {
                console.log('error creating sim');
            } else {
                console.log('Sim successfuly created');
            }
        });
    });

    // Update user display_name.
    app.post('/api/update-user-displayname/', function(request, response) {
        User.update({_id: request.body.userId}, {display_name: request.body.newDisplayName}, function(err) {
            if(err) {
                console.log('error creating sim');
            } else {
                console.log('User display_name successfully updated');
            }
        });
    });

    // Delete setup.
    app.post('/api/delete-setup/', function(request, response) {
        console.log('delete setup id: ' + request.body.setupId)
        Setup.findOne({_id: request.body.setupId})
            .remove()
            .exec();
    });

    // var newSim = new Sim({
    //     name: 'Assetto Corsa',

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
    //     var newCar = new Car({
    //         sim: sim._id,
    //         name: 'Ferrari F40',
    //         category: 'Road'
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

    // Setup.find({}).
    //     populate('author').
    //     populate('car').
    //     populate('track').
    //     populate('sim').
    //     exec(function(err, setups) {
    //         console.log(JSON.stringify(setups, null, "\t"))
    //     });

    // Function to verify if user is logged in.
    function isUserLoggedIn(request, response, next) {
        if (request.isAuthenticated()) {
            return next();
        } else {
            console.log('redirected to home page cause not logged in')
            response.redirect('/');
        }
    }

    function isUserLoggedInAndAdmin(request, response, next) {
        if (request.isAuthenticated() && request.user.admin) {
            return next();
        } else {
            console.log('redirected to home page cause not logged in')
            response.redirect('/#');
        }
    }
};