var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var routes = require('./routes/books')
// var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));


// Middleware
app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.static(path.join(__dirname, 'public')));

// Router
app.use('/books', routes)
app.get('/', (req, res) => res.redirect('/books'));

// 404 Handler
app.use((req, res, next) =>{
  const error = new Error('Page Not Found');
  error.status = 404;
  next(error);
})

// Global Error Handler
app.use((error, req, res, next) => {
  const status = error.status || 500;
  res.status(status);

  if (status === 400) {
    res.render("404",{title: "Page Not Found"});
  } else {
    res.render("error", {title: "Error", message: error.message || "Something went wrong"});
  }
});

//Sync database 
const {sequelize} = require('./models');
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected!');
    await sequelize.sync();
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})(); 

module.exports = app;
