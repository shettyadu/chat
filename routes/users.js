var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
var csrf = require('csurf');


var csrfProtection = csrf();
router.use(csrfProtection);

router.get('/register', function (req, res, next) {
    var messages = req.flash('error');
    res.render('register', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
});

router.post('/register', passport.authenticate('local.signup', {
    failureRedirect: '/users/register',
    failureFlash: true
}), function (req, res, next) {
        res.redirect('/');   
});


router.get('/login', function (req, res, next) {
    var messages = req.flash('error');
    console.log("messages : " + messages);
    res.render('login', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
});

router.post('/login', passport.authenticate('local.signin', {
    failureRedirect: '/users/login',
    failureFlash: true
}), function (req, res, next) {
        res.redirect('/');  
});

router.get('/logout', ensureAuthenticated, function (req, res, next) {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login/');
});

function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } else {
        req.flash('error_msg','You are not logged in');
        res.redirect('/users/login');
    }
}

module.exports = router;