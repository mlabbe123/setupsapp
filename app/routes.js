module.exports = function(app, passport) {
    var fs = require('fs'),
        path = require('path'),
        _ = require('lodash'),
        nodemailer = require('nodemailer'),
        transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.SENDER_USER,
                pass: process.env.SENDER_PASS
            }
        }),
        multer = require('multer'),
        upload = multer({
            dest: path.join(__dirname, '../setups_files/'),
            limits: {
                files: 1,
                filesize: 10000
            }
        }),

        // Models
        Sim = require('./models/sim'),
        User = require('./models/user'),
        Car = require('./models/car'),
        Track = require('./models/track'),
        Setup = require('./models/setup');

    Date.prototype.yyyymmdd = function() {
        var yyyy = this.getFullYear().toString();
        var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
        var dd  = this.getDate().toString();
        return yyyy + '/' + (mm[1]?mm:"0"+mm[0]) + '/' + (dd[1]?dd:"0"+dd[0]); // padding
    };


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
        response.render('profile', {
            user: request.user
        });
    });

    // Download setups.
    app.get('/setup_files/:simid/:setupid', function(request, response) {
        // Up the download counter on the setup in db.
        Setup.update({_id: request.params.setupid, sim: request.params.simid}, {$inc: {downloads: 1}}, function(err, numAffected) {
            if(err) {
                console.log(err)
            } else {
                console.log(numAffected)
            }
        });

        // Get the setup by id, to rename the file to its original name before download.
        Setup.findOne({_id: request.params.setupid}, function(err, setup) {
            if(err) {
                console.log(err);
            } else {
                // Download the file and rename it.
                var file = './setups_files/' + request.params.simid + '/' + request.params.setupid;
                response.download(file, setup.file_name);
            }
        });
    });

    // Confirm account route.
    app.get('/confirm-account', function(request, response) {
        response.render('reset_password', {
            userid: request.query.uid
        });
    });

    // Recover password route.
    app.get('/recover-password', function(request, response) {
        response.render('recover_password', {
            user: request.user
        });
    });

    // Reset password route.
    app.get('/reset-password', function(request, response) {
        response.render('reset_password', {
            userid: request.query.uid
        });
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
        session: false,
        successRedirect: '/register', // redirect to the secure profile section
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
    app.post('/submit-setup', isUserLoggedIn, upload.single('setup_file'), function(request, response, next) {

        if (request.body.botcheck !== undefined) {
            response.render('submit', {
                user: request.user,
                message: 'Are you real?'
            });
        }

        // If no setup file attached.
        if(request.file === undefined) {
            response.render('submit', {
                user: request.user,
                message: 'Please attach a valid setup file.'
            });
        } else {
            var now = new Date();

            // New setup object.
            var newSetup = new Setup({
                author: request.body.user_id,
                sim: request.body.sim,
                sim_version: request.body.version,
                car: request.body.car,
                track: request.body.track,
                type: request.body.trim,
                best_time: request.body.best_time,
                comments: request.body.comments,
                file_name: request.body.setup_name,
                added_date: {
                    timestamp: now,
                    display_time: now.yyyymmdd()
                }
            });

            // Save the setup in db.
            newSetup.save(function(err, setup) {
                if(err) {
                    console.log('Error creating setup.')
                } else {
                    // Setup is in db, file is uploaded, time to rename and move the file in the sim directory.
                    console.log('Setup successfuly created.', setup)

                    // Filename of the new setup file will be its id in the db.
                    var setupFileNewName = setup._id;

                    // Directory the setup file will be move to.
                    var setupFilePath = path.join(__dirname, '../setups_files/', setup.sim.toString(), '/');

                    // Check if path exists, if not, create the dir.
                    fs.exists(setupFilePath, function(exists) {
                        if(!exists) {
                            fs.mkdir(setupFilePath, function() {
                                console.log(setupFilePath, ' directory created');

                                // Move and rename the file.
                                fs.rename(request.file.destination + request.file.filename, setupFilePath + setupFileNewName, function(err) {
                                    if(err) {
                                        console.log(err)
                                        response.render('submit', {
                                            user: request.user,
                                            message: 'There has been an error, please try again.'
                                        });
                                    } else {
                                        console.log('Setup moved and renamed.');
                                        response.render('submit', {
                                            user: request.user,
                                            message: 'Setup successfully uploaded'
                                        });
                                    }
                                });
                            });
                        } else {
                            // Move and rename the file.
                            fs.rename(request.file.destination + request.file.filename, setupFilePath + setupFileNewName, function(err) {
                                if(err) {
                                    console.log(err)
                                    response.render('submit', {
                                        user: request.user,
                                        message: 'There has been an error, please try again.'
                                    });
                                } else {
                                    console.log('Setup moved and renamed.');
                                    response.render('submit', {
                                        user: request.user,
                                        message: 'Setup successfully uploaded'
                                    });
                                }
                            });
                        }
                    })
                }
            });
        }
    });

    // Recover password submission.
    app.post('/recover-password', function(request, response) {
        // Get userid from email.
        User.findOne({email: request.body.email}, {_id:1}, function(err, data) {
            if(err) {
                console.log('Email is not in database.')
                console.log(err)
            } else {
                console.log('User found.');
                // Send email.
                var mailOptions = {
                    from: 'The Setup Market <thesetupmarket@gmail.com>', // sender address
                    to: request.body.email, // list of receivers
                    subject: 'The Setup Market - Reset your password', // Subject line
                    text: 'Please click this link to reset your password. ' + config.base_url + '/reset-password?uid=' + data._id + '. The Setup Market Team.', // plaintext body
                    html: 'Please click this link to reset your password.<br><br><a href="' + config.base_url + '/reset-password?uid=' + data._id + '">Reset your password</a><br><br>The Setup Market Team.' // html body
                };

                transporter.sendMail(mailOptions, function(error, info){
                    if(error){
                        console.log(error);
                    }else{
                        console.log('Message sent: ' + info.response);
                    }
                });
            }
        });

        response.render('recover_password', {
            user: request.user,
            message: 'An email has been sent to the email address you entered.'
        });
    });

    // Reset password route.
    app.post('/reset-password', function(request, response) {
        if(request.body.pass !== request.body.passconfirm) {
            console.log('The two password fields dont match.');
            response.render('reset_password', {
                userid: request.body.userid,
                message: 'The two password fields dont match.'
            });
        } else {
            var tempUser = new User();

            User.update({_id: request.body.userid}, {password: tempUser.generateHash(request.body.pass)},  function(err, user) {
                if(err) {
                    console.log(err);
                    response.render('reset_password', {
                        userid: request.body.userid,
                        message: 'There has been an error processing your request, please try again.'
                    });
                } else {
                    response.render('login', {
                        message: 'Your password has been updated successfully.'
                    });
                }
            });
        }
    });

    // Reset password route.
    app.post('/confirm-account', function(request, response) {
        if(request.body.userid !== request.body.confirmationcode) {
            console.log('The two ids dont match.');
            response.render('confirm_account', {
                userid: request.body.userid,
                message: 'The confirmation code is wrong.'
            });
        } else {
            User.update({_id: request.body.userid}, {confirmed: true}, function(err, numAffected) {
                if (err) {
                    console.log('Error updating confirmed state for user: ' + request.body.userid);

                    response.render('confirm_account', {
                        userid: request.body.userid,
                        message: 'There has been an error in your request. Please contact admins.'
                    });
                } else {
                    response.render('login', {
                        user: request.user
                    });
                }
            });
        }
    });


    // ==============================
    // API SECTION
    // ==============================

    // SIMS ========================

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

    // Add new sim.
    app.post('/api/add-sim/', function(request, response) {
        var newSim = new Sim({
            display_name: request.body.simDisplayName,
            code: request.body.simCode
        });

        newSim.save(function(err) {
            if(err) {
                console.log('error creating sim');
            } else {
                console.log('Sim successfuly created');
                return response.send('ok');
            }
        });
    });


    // USERS ========================

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
                return response.send(users);
            }
        });
    });

    // Retrieve every setups and send back user with most downloads.
    app.get('/api/get-user-with-most-downloads', function(request, response) {
        Setup.find({}, {_id:0, downloads:1, author:1})
            .populate('author')
            .sort('author')
            .exec(function(err, setups) {
                if(err){
                    return console.log(err);
                } else {
                    // We will return this object.
                    var returnObject = {};

                    // Get site download and setups count stats.
                    if (setups.length >= 1000) {
                        returnObject.setups_count = ((parseFloat(25550 / 1000)).toFixed(1)).replace('.0', '') + 'k';

                    } else {
                        returnObject.setups_count = setups.length;
                    }

                    var totalSetupDownloads = 0;

                    _.forEach(setups, function(setup) {
                        totalSetupDownloads += setup.downloads;
                    });

                    returnObject.setups_downloads_total = totalSetupDownloads;

                    // Get user stats.
                    // we have every setups, group them by user id.
                    var setupsByUsers = _.groupBy(setups, function(setup) {
                        return setup.author._id;
                    });


                    var highestTotalDownloads = 0,
                        highestTotalDownloadsUserName,
                        highestTotalSetupsPosted = 0,
                        highestTotalSetupsPostedUserName;

                    // within each users array, concatenate the downloads field for every setups.
                    for (var key in setupsByUsers) {
                        if (setupsByUsers.hasOwnProperty(key)) {

                            // Find user with most setups posted.
                            if (setupsByUsers[key].length >= highestTotalSetupsPosted) {
                                highestTotalSetupsPosted = setupsByUsers[key].length;
                                highestTotalSetupsPostedUserName = setupsByUsers[key][0].author.display_name;
                            }

                            // Find user with most total downloads
                            var totalUserDownloads = 0;

                            _.forEach(setupsByUsers[key], function(userSetup) {
                                totalUserDownloads += userSetup.downloads;
                            });

                            if (totalUserDownloads >= highestTotalDownloads) {
                                highestTotalDownloads = totalUserDownloads;
                                highestTotalDownloadsUserName = setupsByUsers[key][0].author.display_name;
                            }

                            returnObject.user_with_most_setups_ever = highestTotalSetupsPostedUserName;
                            returnObject.user_with_most_downloads_ever = highestTotalDownloadsUserName;
                        }
                    }

                    // Maybe find the poster of the month?

                    return response.send(returnObject);
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


    // SETUPS ========================

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

                    fs.readFile(path.join(__dirname, '../setups_files/', setup.sim._id.toString(), '/', request.params.setupid), 'utf8', function (err,data) {
                        if (err) {
                            return console.log(err);
                        }

                        return response.send(data);
                    });
                }
            });
    });

    // Retrieve every setups for the filters in setups listing page.
    app.get('/api/get-setups-filters-by-simname/:simname', function(request, response) {

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
                        var car_category_filter = [];
                        var sim_version_filter = [];

                        // Loop through every setup returned to build the filters arrays
                        _.forEach(setups, function(setup) {
                            car_filter.push(setup.car.name);
                            track_filter.push(setup.track.name);
                            author_filter.push(setup.author.display_name);
                            type_filter.push(setup['type']);
                            car_category_filter.push(setup.car.category);
                            sim_version_filter.push(setup.sim_version);
                        });

                        setup_filters.car_filters = _.uniq(car_filter);
                        setup_filters.track_filters = _.uniq(track_filter);
                        setup_filters.author_filters = _.uniq(author_filter);
                        setup_filters.type_filters = _.uniq(type_filter);
                        setup_filters.car_category_filters = _.uniq(car_category_filter);
                        setup_filters.sim_version_filters = _.uniq(sim_version_filter);

                        return response.send(setup_filters);
                    }
                });
        });
    });

    // Retrieve every setups for the filters in user profile page.
    app.get('/api/get-setups-filters-by-userid/:userid', function(request, response) {

        Setup.find({ 'author': request.params.userid }).
            populate('author').
            populate('car').
            populate('track').
            populate('sim').
            exec(function(err, setups) {
                if(err){
                    return console.log(err);
                } else {
                    var setup_filters = {};

                    var sim_filter = [];
                    var car_filter = [];
                    var track_filter = [];
                    var type_filter = [];

                    // Loop through every setup returned to build the filters arrays
                    _.forEach(setups, function(setup) {
                        sim_filter.push(setup.sim.display_name);
                        car_filter.push(setup.car.name);
                        track_filter.push(setup.track.name);
                        type_filter.push(setup['type']);
                    });

                    setup_filters.sim_filters = _.uniq(sim_filter);
                    setup_filters.car_filters = _.uniq(car_filter);
                    setup_filters.track_filters = _.uniq(track_filter);
                    setup_filters.type_filters = _.uniq(type_filter);

                    return response.send(setup_filters);
                }
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

    // Delete setup.
    app.post('/api/delete-setup/', function(request, response) {
        console.log('delete setup id: ' + request.body.setupId);

        // Delete db setup.
        Setup.remove({_id: request.body.setupId}, function(err) {
            if(err) {
                return response.send('error');
            } else {
                // Delete setup file on disk.
                fs.unlink(path.join(__dirname, '../setups_files/' + request.body.simId + '/' + request.body.setupId), function(err) {
                    if (err) {
                        return console.log('error delete setup file: ', err);
                    }

                    console.log('Setup File ' + __dirname, '../setups_files/' + request.body.simId + '/' + request.body.setupId + ' has been deleted.')
                });

                return response.send('ok');
            }
        });
    });


    // CARS ========================

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
                return response.send(cars);
            }
        });
    });

    // Add new car.
    app.post('/api/add-car/', function(request, response) {
        var newCar = new Car({
            sim: request.body.sim,
            name: request.body.carName,
            category: request.body.carCategory
        });

        newCar.save(function(err) {
            if(err) {
                console.log('error creating car');
            } else {
                console.log('Car successfuly created');
                return response.send('ok');
            }
        });
    });


    // TRACKS ========================

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

    // Add new track.
    app.post('/api/add-track/', function(request, response) {
        var newTrack = new Track({
            sim: request.body.sim,
            name: request.body.trackName
        });

        newTrack.save(function(err) {
            if(err) {
                console.log('error creating track');
            } else {
                console.log('Track successfuly created');
                return response.send('ok');
            }
        });
    });


    // =============================
    // Functions
    // =============================

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