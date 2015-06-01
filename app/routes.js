module.exports = function(app, passport) {

    // Home page
    app.get('/', function(request, response) {
        response.sendFile('builds/development/index.html', { root: '/Users/mathieu/web/setupsapp/' });
    });

    // Login page

    // Signup page
    app.get('/signup', function(request, response) {
        response.sendFile('builds/development/signup.html', { root: '/Users/mathieu/web/setupsapp/' });
    });

    // Post request 
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // Profile page.
    app.get('/profile', function(request, response) {
        response.render('profile.html');
    });

    // Function to verify if user is logged in.
    function isUserLoggedIn(request, response, next) {
        if(request.isAuthenticated()) {
            return next();
        } else {
            response.redirect('/');
        }
    }
};