var mongoose = require('mongoose');
// Chat Schema
var ChatSchema = mongoose.Schema({ 
	name: {
		type: String
	},
	message : {
		type : String
	},
	username : {
		type : String
	}
});

var Chats = module.exports = mongoose.model('Chats', ChatSchema);