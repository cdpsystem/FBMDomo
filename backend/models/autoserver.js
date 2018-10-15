'use strict'

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let autoServerSchema = new Schema({
	target: String
});

module.exports = mongoose.model('AutoServer',autoServerSchema);