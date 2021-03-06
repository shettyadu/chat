var express = require('express');
var router = express.Router();
var User = require('../models/user')
// Get Homepage
router.get('/', ensureAuthenticated, function(req, res){
	User.find({},(err,users)=>{
		if(err) throw err;
		res.render('index',{users});
	})
	
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/users/login');
	}
}

module.exports = router;