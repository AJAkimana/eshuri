/**
 * Module dependencies.
 */
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const errorHandler = require('errorhandler');
const dotenv = require('dotenv');
const redis= require("redis");
const Redis_Store = require('connect-redis')(session);
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('express-flash');
//const sass = require('node-sass-middleware');
/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
 dotenv.load({ path: '.eShuri.env.PROD'});
/**
 * API keys and Passport configuration.
 */
require('./config/passport')(passport);
/**
 * Create Express server.
 */
const app = express();
/**
 * Connect to MongoDB.
 */
mongoose.connect(process.env.MONGODB_URI,{
  useMongoClient: true,
});
mongoose.Promise = global.Promise;
mongoose.connection.on('error', () => {
  console.error('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});
/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 6000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.locals.pretty=process.env.devStatus =='DEV'

app.use(compression());
// app.use(sass({
//   src: path.join(__dirname, 'public'),
//   dest: path.join(__dirname, 'public')
// }));
// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var hours = 3600000;
var weeks = 7 * 24 * hours;
app.use(session({
  resave: true,
  saveUninitialized: true,//but u should require permission before setting a cookie. 
  secret: process.env.SESSION_SECRET,
  name : 'PHPSESSID',     // Simulate Php cookie
  //When still not connected the cookie will live 2 hours
  cookie:{ path: '/', httpOnly: true, secure: false, maxAge: 2*hours },
  store: new Redis_Store({ 
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      // ttl : 2 * weeks,
      pass: process.env.REDIS_SECRET,
      prefix:process.env.REDIS_PREFIX,
      name: process.env.REDIS_NAME 
    }),
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(express.static(path.join(__dirname, 'public'), { maxAge: 2*hours }));
console.log(__dirname);
/* SOME CONSTANTS in the application*/
require('./constants')(app);
/* Security Modules  down here*/
require('./config/security')(app);
require('./socket_io')(app); // ans atrt the server here
require('./routes')(app);
/**
 * Error Handler.
 */
app.use(errorHandler());
module.exports = app;
// Demo credentials
// student email: student1@demo.rw
// admin email: teacher2@demo.rw
//
// Both Password: eshuri123
// Reset pwd: MyEshuri