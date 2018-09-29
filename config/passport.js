var passport = require('passport');
var User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcryptjs');

passport.serializeUser((user, done) =>{
    done(null, user.id);
});

passport.deserializeUser((id, done) =>{
    User.getUserById(id, (err, user)=> {
        done(err, user);
    });
});


passport.use('local.signup',new LocalStrategy({
    usernameField : 'username',
    passwordField : 'password',
    passReqToCallback : true
},function(req,username,password,done){
    User.findOne({'username' : username},function(err,user){
        if(err){
            return done(err);
        }
        if(user)
        {
            return done(null,false,{message:'Username is already in use'});
        }
        var lower=req.body.name;
        var name = lower.charAt(0).toUpperCase() + lower.substr(1);
        var usertype = req.body.usertype;
        var email = req.body.email;
        var password2 = req.body.password2;
          
        req.checkBody('password2', 'Passwords do not match').notEmpty().equals(req.body.password);
        var errors = req.validationErrors();
        if(errors){
            var messages = [];
            errors.forEach(function(error){
                messages.push(error.msg);
            });
            return done(null,false,{message:'Password and Confirm password should be same.'});
        }
        else
        {
            var newUser = new User({
                name : name,
                email: email,
                username : username,
                password: password,
                usertype : usertype
            });
            User.createUser(newUser,(err, user)=>{
                if(err){
                    return done(null,false,{message:'Email is already in use'});
                }
                else{
                    return done(null,newUser);
                }
            });  
        }
    });
}));


passport.use('local.signin',new LocalStrategy(
    (username, password, done) =>{
        User.getUserByUsername(username,(err, user)=>{
            if(err) throw err;
            if(!user){
                return done(null, false, {message: 'Unknown User'});
            }
            if (!isValidPassword(user, password)){ 
                return done(null, false, {message: 'Invalid password'});
            }   
            return done(null, user)
        });
    }
));

var isValidPassword = function(user, password){
  return bcrypt.compareSync(password, user.password);
}

 
 