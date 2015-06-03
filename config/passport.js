var LocalStrategy = require('passport-local').Strategy;

var User = require('../app/models/user');

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
        console.log(email)
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
                    return done(null, false, request.flash('registerMessage', 'That email is already taken.'));
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
                return done(null, false, request.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
            }

            // all is well, return successful user
            console.log('Welcome');
            return done(null, user);
        });

    }));
}