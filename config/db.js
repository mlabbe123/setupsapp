var mongoose = require('mongoose');

mongoose.connect('mongodb://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@ds051738.mongolab.com:51738/setupmarket');