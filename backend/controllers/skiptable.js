'use strict'

let mongoose = require('mongoose');

let ServerModel = require('../models/server');
let SkipTableModel = require('../models/skiptable');


let controller = {
	home: (req,res)=>{
		return res.status(200).send({message: "Soy la home de Skiptable"});
	},
	addSkiptable:(req,res)=>{

		let skiptable = new SkipTableModel();
			skiptable.target = req.body.target;
			skiptable.arrSkiptables = req.body.arrSkiptable;

		SkipTableModel.find({target: skiptable.target},{},{},(err,rtnSkiptable)=>{

			if(err) return res.status(500).send({message: ""});
			if(rtnSkiptable.length > 0){
				rtnSkiptable[0].arrSkiptables = rtnSkiptable[0].arrSkiptables.concat(skiptable.arrSkiptables);			
				SkipTableModel.findByIdAndUpdate(rtnSkiptable[0]._id,rtnSkiptable[0],(err,skiptableUpdated)=>{
					if(err) return res.status(500).send({message: "Error al actualizar el skiptable", err : err});
					if(!skiptableUpdated) return res.status(404).send({message: "No se ha encontrado el skiptable"});
					return res.status(200).send({skiptableUpdated: rtnSkiptable});	
				});
			}else{

				skiptable.save((err,skiptableStored)=>{
					if(err) return res.status(500).send({message: "Error al guardar la skiptable"});
					if(!skiptableStored) return res.status(404).send({message: "No se ha podido guardar la skiptable"});
					return res.status(200).send({skiptable: skiptableStored});
			});
			}
				
		});
	},

	deleteSkiptableItem: (req,res)=>{
		let skiptable = req.body;
		let skiptableToDelete = req.params.skiptabletodelete;

		SkipTableModel.findByIdAndUpdate(
			skiptable._id,
			{ $pull: { arrSkiptables: skiptableToDelete } },
			(err,skiptableUpdated)=>{
					if(err) return res.status(500).send({message: "Error al actualizar el skiptable", err : err});
					if(!skiptableUpdated) return res.status(404).send({message: "No se ha encontrado el skiptable"});
					return res.status(200).send({skiptableUpdated: skiptableUpdated});	
				});
	},

	getServerSkiptablesById(req,res){
		let serverId = req.params.serverid;
		SkipTableModel.find({target: serverId},{},{},(err,rtnSkipTables)=>{
			if(err) return res.status(500).send({err : "Se ha producido un error al ejecutar la consulta de skitables"});
			if(!rtnSkipTables) return res.status(404).send({err: "No se ha encontrado ninguna skiptable"});
			return res.status(200).send({skiptables: rtnSkipTables});
		});
	}
}

module.exports= controller;