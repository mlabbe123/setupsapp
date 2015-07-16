var db = require('./config/db'),
    express = require('express'),
    app = express(),
    passport = require('passport'),
    flash = require('connect-flash'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    multer = require('multer')
    fs = require('fs');

    _ = require('lodash');

// Express config
app.use(express.static('builds/development'));
app.set('view engine', 'jade');
app.set('views', __dirname + '/frontend/templates/');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Express session config
app.use(session({
    secret: "cookie_secret",
    name: "cookie_name",
    //store: sessionStore, // connect-mongo session store
    //proxy: true,
    resave: true,
    saveUninitialized: true
}));

// Passport config
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// Multer config (file upload)
app.use(multer({ dest: './setups_files/',
    rename: function (fieldname, filename) {
        return filename;
    },
    changeDest: function(dest, request, response) {
        var stat = null;

        try {
            stat = fs.statSync(dest + request.body.sim);
        } catch (err) {
            fs.mkdirSync(dest + request.body.sim);
        }

        if (stat && !stat.isDirectory()) {
            throw new Error('Directory cannot be created because an inode of a different type exists at "' + dest + request.body.sim + '"');
        }

        return dest + request.body.sim;
    },
    onFileUploadStart: function (file) {
        console.log(file.originalname + ' is starting ...')
        // console.log('encoding', file.encoding)
        // console.log('mimetype', file.mimetype)
        // console.log('extension', file.extension)
    },
    onFileUploadComplete: function (file) {
        console.log(file.fieldname + ' uploaded to  ' + file.path)
        done=true;
    }
}));

// Routes config
require('./app/routes.js')(app, passport);

// Start the server
var server = app.listen(3000, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});