var config = require('../config.js')
  , mongoose = require('mongoose')
  , db = mongoose.connect('mongodb://localhost/mydb')
  , Schema = mongoose.Schema;

var guildMember = new Schema({
	  email: String
  	, firstName: String
  	, lastName: lastName
  	, signup: {
  		  ip: socket.handshake.headers['x-real-ip']
	  	, referer: socket.handshake.headers['referer']
	  	, userAgent: socket.handshake.headers['user-agent']
	  	, timestamp: new Date()
});

// module.exports = 

console.dir(Schema);