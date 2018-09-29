var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var Handlebars = require('handlebars');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');
var validator = require('express-validator');
var app = express();
var logger = require('morgan');
var MongoStore = require('connect-mongo')(session);
var server = require('http').createServer(app);
var client = require('socket.io')(server);

server.listen(process.env.PORT || 3000,function(){
   console.log("Port is listening!");
});

require('./config/passport');

var routes = require('./routes/index');
var users = require('./routes/users');

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('html', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'html');

// BodyParser Middleware
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(validator());
// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: false,
    resave: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
  errorFormatter: (param, msg, value) =>{
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Connect Flash
app.use(flash());

// Global Vars
app.use( (req, res, next)=> {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


mongoose.connect('mongodb://adu:adu390@ds247699.mlab.com:47699/adarshchat',{useNewUrlParser: true},function(err, db){
    if(err){
        throw err;
    }
    console.log('MongoDB connected...');
    // Connect to Socket.io
    client.on('connection', function(socket){
        //import chat schema
        let chat = require('./models/chats');
        // Create function to send status
        sendStatus = function(s){
            socket.emit('status', s);
        }
        // Get chats from mongo collection
        chat.find().limit(100).sort({_id:1}).lean().exec(function(err, res){
            if(err){
                throw err;
            }
            //Emit the messages
            socket.emit('output', res);
        });

        // Handle input events
        socket.on('input', function(data){
            let name = data.name;
            let message = data.message;
            let username = data.username;   
            if(name == '' || message == '' ){
              sendStatus('Please fill all the information');
            }else {
                // Insert message
                var Chat1 = new chat({
                    name: name,
                    message: message,
                    username : username
                });
                Chat1.save(function(err, result){
                    client.emit('output', [data]);
                    // Send status object
                    sendStatus({
                         message: 'Message sent',
                         clear: true
                    });
                });    
                     
            }//else end     
        });
                
    });
});

module.exports = app;