'use strict'

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let logBackupSchema = new Schema({
	alias: String,
	ip: String,
	database: String,
	backupDate: String,
	remoteFilePath: String,
	localFilePath: String,
	type: String,
	trigger: String,
	log: Array
});

module.exports = mongoose.model('Backuplog',logBackupSchema);