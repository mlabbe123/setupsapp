var LocalStrategy = require('passport-local').Strategy;

var User = require('../app/models/user');

Date.prototype.yyyymmdd = function() {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
    var dd  = this.getDate().toString();
    return yyyy + '/' + (mm[1]?mm:"0"+mm[0]) + '/' + (dd[1]?dd:"0"+dd[0]); // padding
};

module.exports = function(passport) {
    // Serialize the user for the session.
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // Deserialize the user.
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // Local Register.
    passport.use('local-register', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(request, email, password, done) {

        // Hidden checkbox bot protection.
        if(request.body.botcheck !== undefined) {
            return done(null, false, request.flash('registerMessage', 'Are you real?'));
        }

        // process.nextTick(function() {
        //     User.findOne({ display_name: request.body.username }, function (err, user) {
        //         if (err) {
        //             console.log(err);
        //             return done(err);
        //         }

        //         if(user) {
        //             console.log('That username is already taken.')
        //             return done(null, false, request.flash('registerMessage', 'That username is already taken.'));
        //         }
        //     });
        // });

        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {

            // Find one document matching the provided email address.
            User.findOne({ email: email }, function (err, user) {
                if (err) {
                    console.log(err)
                    return done(err);
                }

                if (!user) {
                    // if there is no user with that email
                    // create the user
                    var newUser = new User();

                    // set the user's local credentials
                    newUser.email = email;
                    newUser.password = newUser.generateHash(password);
                    newUser.display_name = request.body.username;
                    var now = new Date();
                    newUser.join_date = now.yyyymmdd();
                    newUser.admin = false;

                    // save the user
                    newUser.save(function(err) {
                        if (err) {
                            throw err;
                        }
                        return done(null, newUser);
                    });

                    console.log('User ' + newUser.email + 'successfully created.')
                } else {
                    console.log('That email is already taken.')
                    return done(null, false, request.flash('registerMessage', 'That email address is already taken.'));
                }
            });
        });
    }));

    // Local login.
    passport.use('local-login', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(request, email, password, done) { // callback with email and password from our form

        // Hidden checkbox bot protection.
        if(request.body.botcheck !== undefined) {
            return done(null, false, request.flash('loginMessage', 'Are you real?'));
        }

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ email :  email }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err) {
                console.log(err)
                return done(err);
            }

            // if no user is found, return the message
            if (!user) {
                console.log('User not found.');
                return done(null, false, request.flash('loginMessage', 'No user found.'));
            }

            // if the user is found but the password is wrong
            if (!user.isPasswordValid(password)) {
                console.log('Oops! Wrong password.')
                return done(null, false, request.flash('loginMessage', 'Wrong email address / password combination.')); // create the loginMessage and save it to session as flashdata
            }

            // all is well, return user
            return done(null, user);
        });

    }));
}