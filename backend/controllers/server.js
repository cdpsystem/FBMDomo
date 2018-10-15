'use strict'

let mongoose = require('mongoose');
let del = require('del');
let NodeSSH = require('node-ssh');

let ServerModel = require('../models/server');
let BackupLogModel = require('../models/backuplog');
let SkipTableModel = require('../models/skiptable');
let AutoServerModel = require('../models/autoserver');


let controller = {

	home: function(req,res){
		return res.status(200).send({
			message : "Soy la Home"
		})
	},
	addServer: function(req,res){
		let server = new ServerModel();

		let params = req.body;

		server.alias = params.alias;
		server.ip = params.ip;
		server.userSSH = params.userSSH;
		server.passSSH = params.passSSH;
		server.database = params.database;
		server.userDB = params.userDB;
		server.passDB = params.passDB;

		server.save((err,serverStored)=>{
			if(err) return res.status(500).send({message: "Error al guardar el servidor"});
			if(!serverStored) return res.status(404).send({message: "NO se ha podido guardar el Servidor"});
			return res.status(200).send({server: serverStored});
		});
	},
	delServer: (req,res)=>{
		let server = new ServerModel();
		let backups = new BackupLogModel();

		let filePathDelete= [];

		let params = req.body;

		server._id = params._id
		server.alias = params.alias;
		server.ip = params.ip;
		server.userSSH = params.userSSH;
		server.passSSH = params.passSSH;
		server.database = params.database;
		server.userDB = params.userDB;
		server.passDB = params.passDB;

		del(['backups/'+server.alias+'/'+server.database])
			.then(paths => {
    		console.log('Deleted files and folders:\n', paths.join('\n'));
		});

		BackupLogModel.deleteMany(
			{	
			 alias: server.alias,
			 ip: server.ip,
			 database: server.database
			},
			{},
			(err,deletedBackups)=>{
				if(err) console.log("Error al borrar los backuplogs");
			}
		);
		SkipTableModel.deleteMany(
			{	
			 target: server._id,
			},
			{},
			(err,deletedBackups)=>{
				if(err) console.log("Error al borrar los SkipTables");
			}
		);
		ServerModel.deleteOne(
			{	
			 "_id": mongoose.Types.ObjectId(server._id),
			},
			(err,deletedBackups)=>{
				if(err) console.log("Error al borrar los SkipTables");
			}
		);

		return res.status(200).send({message: "Servidor borrado"});

		/*
		BackupLogModel.find(
			{
             alias: server.alias,
			 ip: server.ip,
			 database: server.database
			},
			{},
			(err,backuplogsFound) => {
			
			}
		);*/

		

		return res.status(200);
	},
	getServers: (req,res) => {
		ServerModel.find({},{},{ sort: { alias : 1, database : 1 } }).exec((err,servers)=>{
			if(err) return res.status(500).send({message: "Error al devolver los datos"});
			if(!servers) return res.status(404).send({message: "No hay servidores guardados"});
			return res.status(200).send({server: servers});
		});
	},
	getServerById: (req,res)=>{		
		let serverId = req.body._id;
		ServerModel.findById(serverId,(err,server) =>{
			if(err) return res.status(500).send({message: "Error al devolver los datos"});
			if(!server) return res.status(404).send({message: "No se ha encontrado el servidor"});
			return res.status(200).send({server: server});	
		});
	},
	updateServer: (req,res)=>{
		let serverId = req.params.id;
		let update =  req.body;

		ServerModel.findByIdAndUpdate(serverId,update,(err,serverUpdate)=>{
			if(err) return res.status(500).send({message: "Error al actualizar el servidor", err : err});
			if(!serverUpdate) return res.status(404).send({message: "No se ha encontrado el servidor"});
			return res.status(200).send({serverUpdate: serverUpdate});	
		});
	},
	getServerLogById: (req,res)=>{
		let serverId = req.params.id;
		let serverDatabase = req.params.database;
		
		BackupLogModel.find({ip: serverId,database: serverDatabase },{},{sort: {_id: -1} },(err,serverLog)=>{
			if(err) return res.status(500).send({message: "Error en el proceso de busqueda", err : err});
			if(!serverLog) return res.status(404).send({message: "No se ha encontrado el serverlog"});
			return res.status(200).send({serverlog: serverLog});	
		});
	},
	getResume: (req,res)=>{
		let returnInfo = {};
		returnInfo.nSkipTables = 0;
		
		ServerModel.estimatedDocumentCount((err,count)=>{
			returnInfo.nServers = count;
			SkipTableModel.find()
			.exec((err,skiptablesFound)=>{

				skiptablesFound.forEach((skiptable)=>{returnInfo.nSkipTables += skiptable.arrSkiptables.length;});

				BackupLogModel.find({})
					.limit(20)
					.sort({ _id: -1 })
					.exec((err,backupLogsFound)=>{
						returnInfo.lastLogs = backupLogsFound;
						AutoServerModel.estimatedDocumentCount((err,count)=>{
							returnInfo.nAutoServers = count;
							return res.status(200).send({returnInfo : returnInfo});	
						})
					})
			});
		});
	},
	getServerInfo: async(req,res)=>{
		//Creamos variable conexión ssh
		let ssh = new NodeSSH();

		//Acortamos el acceso a los datos de POST
		let params = req.body;

		//Comando
		let comando;

		let providerInfo;

		//Obtenemos el puerto o lo generamos de forma automática si no tiene puerto especificado
		let serverIpArray = params.ip.split(":");
		if(serverIpArray.length == 1){
			serverIpArray[1] = 22;
		}
		try{
			//Bloque conectar al FTP
			await ssh.connect({host: serverIpArray[0], port: serverIpArray[1], username: params.userSSH, password: params.passSSH});

			//Free space			
			comando = "fbmdomo_backup2 --serverstatus";			
			let stdout =  (await ssh.execCommand(comando, { cwd:'${HOME}/fbmdomo/' })).stdout.split("\n");
			stdout = stdout[1].split(" ");
			let stdoutFiltered = stdout.filter(function(el) { return el; });

			//Provider status
			comando = "fbmdomo_backup2 --providerstatus"
			let stdout2 =  (await ssh.execCommand(comando, { cwd:'${HOME}/fbmdomo/' })).stdout.split("\n");

			

			res.status(200).send({freeSpace: stdoutFiltered, providers: stdout2});
		}catch(err){res.status(500).send({err: err});} 
		return res;
		
	}
}

module.exports = controller;