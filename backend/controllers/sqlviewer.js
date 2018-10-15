'use strict'

let mongoose = require('mongoose');

let ServerModel = require('../models/server');
let SkipTableModel = require('../models/skiptable');


let controller = {

	sqlInfo:(req,res)=>{
		console.log(res.body);
	}

}

module.exports = controller;