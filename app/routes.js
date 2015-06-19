module.exports = function(app, passport) {

    // ===========================
    // GET requests

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

    // Signup page
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

    // ===========================
    // POST requests
    // ===========================
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

    app.post('/upload-setup', passport.authenticate('local-login', {
        successRedirect: '/', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // Logout page.
    app.get('/logout', function(request, response) {
        request.logout();
        response.redirect('/');
    });

    // ==============================
    // API SECTION
    // ==============================
    // app.get('/api/get-setups', function(request, response) {
    //     console.log('Please get those setups')

    // });

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