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
        storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, path.join(__dirname, '../setups_files/'));
            },
            filename: function (req, file, cb) {
                cb(null, file.originalname);
            }
        }),
        upload = multer({
            storage: storage,
            limits: {
                files: 1,
                filesize: 10000
            }
        }),
        config = require('../config/config'),

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
    // app.get('/submit-setup', isUserLoggedIn, function(request, response) {
    //     response.render('submit', {
    //         user: request.user,
    //         message: request.flash('submitSetupMessage')
    //     });
    // });

    // Download setups.
    app.get('/setup_files/:simid/:setupid', function(request, response) {
        // Up the download counter on the setup in db.
        Setup.update({_id: request.params.setupid, sim: request.params.simid}, {$inc: {downloads: 1}}, function(err, numAffected) {
            if(err) {
                console.log(err);
            } else {
                console.log('Setup ' + request.params.setupid + ' downloaded');
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
        response.render('confirm_account', {
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
        request.session.destroy();
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

    // Recover password submission.
    app.post('/recover-password', function(request, response) {
        // Get userid from email.
        User.findOne({email: request.body.email}, {_id:1}, function(err, data) {
            if(err) {
                console.log('RECOVER PASSWORD: Email is not in database.');
                console.log(err);
            } else {
                console.log('RECOVER PASSWORD: User found.');
                // Send email.
                var mailOptions = {
                    from: 'The Setup Market <thesetupmarket@gmail.com>', // sender address
                    to: request.body.email, // list of receivers
                    subject: 'The Setup Market - Reset your password', // Subject line
                    text: 'Please click this link to reset your password. ' + config.base_url + '/reset-password?uid=' + data._id + '. The Setup Market team.', // plaintext body
                    html: 'Please click this link to reset your password.<br><br><a href="' + config.base_url + '/reset-password?uid=' + data._id + '">Reset your password</a><br><br>The Setup Market team.' // html body
                };

                transporter.sendMail(mailOptions, function(error, info){
                    if(error){
                        console.log(error);
                    }else{
                        console.log('RECOVER PASSWORD: Message sent: ' + info.response);
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
            console.log('RESET PASSWORD: The two password fields dont match.');
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
            console.log('RESET PASSWORTD: The two ids dont match.');
            response.render('confirm_account', {
                userid: request.body.userid,
                message: 'The confirmation code is wrong.'
            });
        } else {
            User.update({_id: request.body.userid}, {confirmed: true}, function(err, numAffected) {
                if (err) {
                    console.log('RESET PASSWORD: Error updating confirmed state for user: ' + request.body.userid);

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

    // MISC ========================

    // Retreive the market stats.
    // app.get('/api/get-market-stats/', function(request, response) {
    //     var marketStats = {};

    //     User.find(function(err, users) {
    //         if (err) {
    //             console.log('error retreiving all users');
    //         } else {
    //             marketStats.usersCount = users.length;

    //             Setup

    //             console.log('marketStats: ', marketStats);
    //         }
    //     });
    // });

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
                console.log('error creating sim', err);
            } else {
                console.log('User display_name successfully updated');
            }
        });
    });


    // SETUPS ========================

    // Retreive setups specific to a sim.
    app.get('/api/get-setups/:simname', function(request, response) {

        Sim.findOne({'display_name': request.params.simname}, function(err, sim) {
            if (err || !sim) {
                console.log('GET SETUPS API: Error retreiving id for simname: ' + request.params.simname, err);
                return response.status(500).send(err);
            } else {
                Setup.find({ 'sim': sim._id }).
                    populate('author').
                    populate('car').
                    populate('track').
                    populate('sim').
                    exec(function(err, setups) {
                        if(err){ 
                            console.log('GET SETUPS API: Error finding setups that matches simId: ' + sim._id, err);
                            return response.status(500).send(err);
                        } else {
                            return response.send(setups);
                        }
                    });
            }
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
            if (err || !sim) {
                console.log('GET SETUPS FILTERS BY SIMNAME: Error retreiving setups for simname: ' + request.params.simname, err);
                return response.status(500).send(err);
            } else {
                Setup.find({ 'sim': sim._id }).
                populate('author').
                populate('car').
                populate('track').
                populate('sim').
                exec(function(err, setups) {
                    if(err){
                        console.log(err);
                        return response.status(500).send(err);
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
            }
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
                    var setup_filters = {},
                        sim_filter = [],
                        car_filter = [],
                        track_filter = [],
                        type_filter = [],
                        sim_version_filter = [];

                    // Loop through every setup returned to build the filters arrays
                    _.forEach(setups, function(setup) {
                        sim_filter.push(setup.sim.display_name);
                        car_filter.push(setup.car.name);
                        track_filter.push(setup.track.name);
                        type_filter.push(setup['type']);
                        sim_version_filter.push(setup.sim_version);

                    });

                    setup_filters.sim_filters = _.uniq(sim_filter);
                    setup_filters.car_filters = _.uniq(car_filter);
                    setup_filters.track_filters = _.uniq(track_filter);
                    setup_filters.type_filters = _.uniq(type_filter);
                    setup_filters.sim_version_filters = _.uniq(sim_version_filter);

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
                    return response.send(setups);
                }
            });
    });

    // Setup form submission.
    app.post('/api/create-setup/', upload.single('file'), function(request, response) {

        // if (request.body.botcheck !== undefined) {
        //     response.render('submit', {
        //         user: request.user,
        //         message: 'Are you real?'
        //     });
        // }

        // If no setup file attached.
        if(request.body.file_name === undefined) {
            console.log('CREATE SETUP API: Error, no file received.');
            return response.status(500).send({
                status: 'error',
                msg: 'There has been a server error, please try again.'
            });
        } else {
            var now = new Date();

            // New setup object.
            var newSetup = new Setup({
                author: request.body.user_id,
                sim: request.body.sim_id,
                sim_version: request.body.sim_version,
                car: request.body.car_id,
                track: request.body.track_id,
                type: request.body.trim,
                best_time: request.body.best_laptime,
                comments: request.body.comments.replace(/<(?:.|\n)*?>/gm, ''),
                file_name: request.body.file_name,
                added_date: {
                    timestamp: now,
                    display_time: now.yyyymmdd()
                }
            });

            // Save the setup in db.
            newSetup.save(function(err, setup) {
                if(err) {
                    console.log('CREATE SETUP API: Error saving setup in db.');
                    return response.status(500).send({
                        status: 'error',
                        msg: 'There has been a server error, please try again.'
                    });
                } else {
                    // Setup is in db, file is uploaded, time to rename and move the file in the sim directory.
                    // Filename of the new setup file will be its id in the db.
                    var setupFileNewName = setup._id;

                    // Directory the setup file will be move to.
                    var setupFilePath = path.join(__dirname, '../setups_files/', setup.sim.toString(), '/');

                    // Check if path exists, if not, create the dir.
                    fs.exists(setupFilePath, function(exists) {
                        if(!exists) {
                            fs.mkdir(setupFilePath, function() {
                                console.log('SETUP CREATION API: ', setupFilePath, ' directory created');
                                // Move and rename the file.
                                fs.rename(request.file.path, setupFilePath + setupFileNewName, function(err) {
                                    if(err) {
                                        console.log('SETUP CREATION API: Error moving and renaming file in new sim. ', err)
                                        return response.status(500).send({
                                            status: 'error',
                                            msg: 'There has been an error, please try again.'
                                        });
                                    } else {
                                        return response.status(200).send({
                                            status: 'success',
                                            msg: 'Setup successfully uploaded'
                                        });
                                    }
                                });
                            });
                        } else {
                            // Move and rename the file.
                            fs.rename(request.file.path, setupFilePath + setupFileNewName, function(err) {
                                if(err) {
                                    console.log('SETUP CREATION API: Error moving and renaming file. ', err);
                                    return response.status(500).send({
                                        status: 'error',
                                        msg: 'There has been an error, please try again.'
                                    });
                                } else {
                                    return response.status(200).send({
                                        status: 'success',
                                        msg: 'Setup successfully uploaded'
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });

    // Update setup.
    app.post('/api/update-setup/', function(request, response) {
        Setup.update({_id: request.body.setup_id}, {sim_version: request.body.sim_version, type: request.body.trim, best_time: request.body.best_laptime, comments: request.body.comments}, function(err, numAffected) {
            if(err) {
                console.log('UPDATE SETUP API: Error updating setup_id: request.body.setup_id.', err);
                return response.status(500).send({
                    status: 'error',
                    msg: 'There has been a server error, please try again.'
                });
            } else {
                return response.status(200).send({
                    status: 'success',
                    msg: 'Setup updated successfully.'
                });
            }
        });
    });

    // Update setup with file.
    app.post('/api/update-setup-with-file/', upload.single('file'), function(request, response) {
        if(request.body.file_name === undefined) {
            console.log('EDIT SETUP WITH FILE API: Error, no file received.');
            return response.status(500).send({
                status: 'error',
                msg: 'There has been a server error, please try again.'
            });
        } else {
            Setup.update({_id: request.body.setup_id}, {file_name: request.body.file_name, sim_version: request.body.sim_version, type: request.body.trim, best_time: request.body.best_laptime, comments: request.body.comments, $inc: {version: 1}}, function(err, numAffected) {
                if(err) {
                    console.log('EDIT SETUP WITH FILE API: Error updating setup_id: request.body.setup_id.', err);
                    return response.status(500).send({
                        status: 'error',
                        msg: 'There has been a server error, please try again.'
                    });
                } else {
                    // Setup is in db, file is uploaded, time to rename and move the file in the sim directory.
                    // Filename of the new setup file will be its id in the db.
                    var setupFileNewName = request.body.setup_id;

                    // Directory the setup file will be move to.
                    var setupFilePath = path.join(__dirname, '../setups_files/', request.body.sim_id.toString());

                    // Move and rename the file.
                    fs.rename(request.file.path, setupFilePath + setupFileNewName, function(err) {
                        if(err) {
                            console.log('EDIT SETUP API: Error moving and renaming file. ', err);
                            return response.status(500).send({
                                status: 'error',
                                msg: 'There has been an error, please try again.'
                            });
                        } else {
                            return response.status(200).send({
                                status: 'success',
                                msg: 'Setup successfully reuploaded.'
                            });
                        }
                    });
                }
            });
        }
    });

    // Update setup rating.
    app.post('/api/update-setup-rating/', function(request, response) {
        Setup.findOne({_id: request.body.setupId}, function(err, setup) {
            if(err) {
                console.log(err);
                return response.send('error');
            } else {
                if (setup.ratings && setup.ratings.length > 0) {
                    // Flag in case the rating for this userId exist more than once.
                    var updated = false;

                    // If the setup already has ratings, search if the user has already rated it.
                    _.forEach(setup.ratings, function(rating) {
                        // If the user has already rated the setup, update his rating.
                        if (rating.userId === request.body.userId && !updated) {
                            updated = true;

                            Setup.update({ 'ratings._id': rating._id }, {'$set': {'ratings.$.rating': request.body.setupRating}}, function(err, setup) {
                                if(err) {
                                    console.log('SETUP DETAIL: error updating rating. ', err);
                                    return response.send('error');
                                } else {
                                    console.log('SETUP DETAIL: rating successfully updated.');
                                    return response.send('ok');
                                }
                            });


                        } else if (!updated) {
                            // If not, add his rating.
                            Setup.update({ _id: request.body.setupId }, {$push: {'ratings' : {userId: request.body.userId, rating: request.body.setupRating}}}, function(err, setup) {
                                if(err) {
                                    console.log('SETUP DETAIL: error pushing rating. ', err);
                                    return response.send('error');
                                } else {
                                    console.log('SETUP DETAIL: rating successfully pushed.');
                                    return response.send('ok');
                                }
                            });
                        }
                    });

                } else {
                    Setup.update({ _id: request.body.setupId }, {$push: {'ratings': {userId: request.body.userId, rating: request.body.setupRating}}}, function(err, setup) {
                        if(err) {
                            console.log('SETUP DETAIL: error pushing rating to setup with empty ratings. ', err);
                            return response.send('error');
                        } else {
                            console.log('SETUP DETAIL: rating successfully pushed to setup with empty ratings.');
                            return response.send('ok');
                        }
                    });
                }
            }
        });
    });

    // Delete setup.
    app.post('/api/delete-setup/', function(request, response) {

        // Delete db setup.
        Setup.remove({_id: request.body.setupId}, function(err) {
            if(err) {
                return response.status(500).send({
                    status: 'error',
                    msg: 'There has been an error, please try again.'
                });
            } else {
                // Delete setup file on disk.
                fs.unlink(path.join(__dirname, '../setups_files/' + request.body.simId + '/' + request.body.setupId), function(err) {
                    if (err) {
                        return response.status(500).send({
                            status: 'error',
                            msg: 'There has been an error, please try again.'
                        });
                    } else {
                        console.log('DELETE SETUP API: Setup File ' + __dirname, '../setups_files/' + request.body.simId + '/' + request.body.setupId + ' has been deleted.')

                        return response.status(200).send({
                            status: 'success',
                            msg: 'Setup successfully deleted.'
                        });
                    }
                });
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
                console.log('error creating car', err);
            } else {
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
                console.log('error creating track', err);
            } else {
                return response.send('ok');
            }
        });
    });

    // =============================
    // AC app
    // =============================

    // Get setups.
    app.get('/api/get-setups-for-app/:carid/:trackid/', function(request, response) {
        console.log(request.params)

        Setup.find({ 
            $or: [
                // Find setups for this car and track
                { 'sim': '55c2cddddebcbba924bb2a34', 'car': request.params.carid, 'track': request.params.trackid },
                // Find setups that have 'Any' as track
                { 'sim': '55c2cddddebcbba924bb2a34', 'car': request.params.carid, 'track': '55db6db13cc3a26dcae7116d' }
            ]
            }).
            populate('author').
            exec(function(err, setups) {
                if(err){ 
                    console.log('GET SETUPS API: Error finding setups that matches simId: ' + sim._id, err);
                    return response.status(500).send(err);
                } else {
                    return response.send(setups);
                }
            });
    });


    // =============================
    // Error pages routes
    // =============================
    app.use(function(req, res, next) {
        res.status(404).render('tocompile/error_pages/404');
    });

    app.use(function(err, req, res, next) {
        console.error(err.stack);
        res.status(500).render('tocompile/error_pages/50x');
    });


    // =============================
    // Functions
    // =============================

    // Function to verify if user is logged in.
    function isUserLoggedIn(request, response, next) {
        if (request.isAuthenticated()) {
            return next();
        } else {
            response.redirect('/');
        }
    }

    function isUserLoggedInAndAdmin(request, response, next) {
        if (request.isAuthenticated() && request.user.admin) {
            return next();
        } else {
            response.redirect('/#');
        }
    }
};