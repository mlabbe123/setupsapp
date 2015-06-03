module.exports = function(app, passport, statidDir) {

    // Home page
    app.get('/', function(request, response) {
        response.render('index');
    });

    // Login page
    app.get('/login', function(request, response) {
        response.render('login', {
            message: request.flash('loginMessage')
        });
    });

    // Signup page
    app.get('/register', function(request, response) {
        response.render('register', {
            message: request.flash('registerMessage')
        });
    });

    // Post requests
    app.post('/register', passport.authenticate('local-register', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/register', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // Profile page.
    app.get('/profile', isUserLoggedIn, function(request, response) {
        response.render('profile', {
            user: request.user
        });
    });

    // Logout page.
    app.get('/logout', function(request, response) {
        request.logout();
        response.redirect('/');
    });

    // Function to verify if user is logged in.
    function isUserLoggedIn(request, response, next) {
        if (request.isAuthenticated()) {
            return next();
        } else {
            console.log('redirected to home page cause not logged in')
            response.redirect('/');
        }
    }
};