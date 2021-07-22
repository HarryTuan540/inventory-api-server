var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cors = require('cors');
require('dotenv').config();
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.set('useCreateIndex', true);
const dbUrl = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_IP}/WebAppInventory`;
const db = (process.env.DB_USERNAME !== undefined) ? dbUrl : process.env.DB_URL;
mongoose.connect(db, {
  //mongoose.connect(process.env.DB_URL,  {
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: false
}).then(() => console.log('DB Connected!'))
  .catch(err => {
    console.log(`DB Connection Error1: ${err.message}`);
    console.log(dbUrl)
  });

var app = express();
var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
// app.use(cors());
app.use(cors(corsOptions));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(logger('dev'));
app.use(bodyParser.json())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Add headers
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);
  // Pass to next layer of middleware
  next();
});

app.use('/', indexRouter);
//app.use('/users', usersRouter);
app.use('/users', require('./routes/users'));
app.use('/drivers', require('./routes/drivers'));
app.use('/warehouses', require('./routes/warehouse'));
app.use('/phieunhapkho', require('./routes/phieunhapkho'));
app.use('/phieuxuatkho', require('./routes/phieuxuatkho'));
app.use('/kiemke', require('./routes/kiemke'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
