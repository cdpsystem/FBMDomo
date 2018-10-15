'use strict'

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let server = new Schema({
	alias: String,
	ip: String,
	userSSH: String,
	passSSH: String,
	database: String,
	userDB: String,
	passDB: String
});

module.exports =  mongoose.model('Server',server);
