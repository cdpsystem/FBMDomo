'use strict'

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let skiptableSchema = new Schema({
	target: String,
	arrSkiptables: Array,
})

module.exports = mongoose.model('Skiptable',skiptableSchema);