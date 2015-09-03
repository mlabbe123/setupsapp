var config = require('./config/config'),
    express = require('express'),
    app = express(),
    passport = require('passport'),
    flash = require('connect-flash'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    mongoStore = require('connect-mongo')(session),
    fs = require('fs'),
    mongoose = require('mongoose');

// Connection to mongodb.
mongoose.connect('mongodb://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@' + process.env.DB_ADDRESS);
// DELETE THIS ON LAUNCH
// process.env.DB_USER = mlabbe
// process.env.DB_PASS = GlaspRob321
// process.env.DB_ADDRESS = ds051738.mongolab.com:51738/setupmarket
// process.env.SENDER_USER = thesetupmarket@gmail.com
// process.env.SENDER_PASS = GlaspRob321
// process.env.NODE_ENV = PROD || DEV
// DB_USER=mlabbe DB_PASS=GlaspRob321 DB_ADDRESS=ds051738.mongolab.com:51738/setupmarket SENDER_USER=thesetupmarket@gmail.com SENDER_PASS=GlaspRob321

// Express config
// If we are in dev, express will serve the static content, in prod, we let nginx take care of that.
if (config.node_env === "DEV") {
    app.use(express.static('static'));
}

app.set('view engine', 'jade');
app.set('views', __dirname + '/frontend/templates/');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Express session config
app.use(session({
    store: new mongoStore({ mongooseConnection: mongoose.connection }),
    secret: "cookie_secret",
    name: "cookie_name",
    resave: false,
    saveUninitialized: false
}));

// Passport config
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// Routes config
require('./app/routes.js')(app, passport);

// Start the server
var server = app.listen(process.env.PORT || 8080, function () {

    var host = server.address().address;
    var port = server.address().port;
});