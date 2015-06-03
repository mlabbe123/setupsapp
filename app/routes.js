module.exports = function(app, passport, statidDir) {

    // Home page
    app.get('/', function(request, response) {
        response.render('index');
    });

    // Login page
    app.get('/login', function(request, response) {
        response.render('login');
    });

    // Signup page
    app.get('/register', function(request, response) {
        response.sendFile('builds/development/register.html', { root: statidDir });
    });

    // Post requests
    app.post('/register', passport.authenticate('local-register', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/register', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // Profile page.
    app.get('/profile', isUserLoggedIn,  function(request, response) {
        response.sendFile('builds/development/profile.html', { root: statidDir });
    });

    // Function to verify if user is logged in.
    function isUserLoggedIn(request, response, next) {
        if(request.isAuthenticated()) {
            return next();
        } else {
            console.log('redirected to home page cause not logged in')
            response.redirect('/');
        }
    }
};