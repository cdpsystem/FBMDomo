'use strict'
let NodeSSH = require('node-ssh');
let clientFTP = require('ftp');
let mongoose = require('mongoose');
let moment = require('moment');
let fs = require('fs');
let recursive = require('recursive-readdir');

let ServerModel = require('../models/server');
let BackupLogModel = require('../models/backuplog');
let SkipTableModel = require('../models/skiptable');
let AutoServerModel = require('../models/autoserver');

let controller = {

	home: (req,res)=>{
		return res.status(200).send({message : "Estas en la home de backuplog"});
	},

	createBackup: async(req,res)=>{

		//Conexion remota para la gestion de archivos y generación de backups
		let ssh = new NodeSSH();
		//Conexion local al FTP almacén
		let ftpLocal = new clientFTP();
		//String limpio para la creación del comando
		let comando = "";
		//String con el path local del archivo
		let localPath = "";
		//Acortacion de nombre
		let params = req.body;
		//Models
		let bckupLog = new BackupLogModel();
			//Rellenamos bckupLog con lo que tenemos por ahora
			bckupLog.alias = params.alias;
			bckupLog.ip = params.ip;
			bckupLog.backupDate = Date.now();
			bckupLog.database = params.database;
			bckupLog.trigger = params.trigger;
	  		bckupLog.type = params.type;

		//Obtenemos el puerto o lo generamos de forma automática si no tiene puerto especificado
		let serverIpArray = params.ip.split(":");
		if(serverIpArray.length == 1){
			serverIpArray[1] = 22;
		}

		console.log("Comenzando la creacion de un backup ("+bckupLog.type+") en el servidor -> " + serverIpArray);

		//Obtencion skiptablesç
		if(params.type == "data"){
			let strSkipTables = "";
			try {
		    	let skpTables = await SkipTableModel.find({target: params._id},{},{});
			    if(skpTables.length > 0){
					skpTables[0].arrSkiptables.forEach((skiptable)=>{
						strSkipTables+=params.database + '.' + skiptable+'¿';
					});
				}				
			} catch (error) {
				console.log('There was an error: ', error);
				return res.status(500).send({error:"Error al obtener las skiptables"});
			}
			//Eliminamos el ultimo ¿ que sobra
			strSkipTables=strSkipTables.slice(0,-1);
			comando = 'fbmdomo_backup2 --'+params.type+' '+params.database+' '+params.userDB+' '+params.passDB + ' ' + strSkipTables;
		}else{
			//Si es estructura, nos interesa que no lo haga.
			comando = 'fbmdomo_backup2 --'+params.type+' '+params.database+' '+params.userDB+' '+params.passDB;
		}

		//Realizamos la conexion con el host y generamos la backup
		try{			
			await ssh.connect({host: serverIpArray[0], port: serverIpArray[1], username: params.userSSH, password: params.passSSH});
			let stdout =  (await ssh.execCommand(comando, { cwd:'${HOME}/fbmdomo/' })).stdout.split("\n");
			bckupLog.remoteFilePath = stdout[4];
	  		bckupLog.log = stdout.slice(5);	
			
		}catch (error){
			console.log(error);
			return res.status(500).send({error: "Se ha producido un error al generar la backup"})
		}


		//Generamos la ruta local en el backend para almacenar la backup
		localPath = "backups/"+bckupLog.alias+"/";
  		if(!fs.existsSync(localPath)){
  			fs.mkdirSync(localPath);
  		}							  		

  		localPath += bckupLog.database+'/';
  		if(!fs.existsSync(localPath)){
  			fs.mkdirSync(localPath);
  		}	

  		localPath += moment.unix(bckupLog.backupDate / 1000).format('DD-MM-YYYY')+'/';
  		if(!fs.existsSync(localPath)){
  			fs.mkdirSync(localPath);
  		}			  	

  		localPath = localPath+Math.trunc(bckupLog.backupDate/100)+'_'+bckupLog.database+'_'+bckupLog.type+'.sql';
  		bckupLog.localFilePath= localPath;

  		//Descargamos el archivo generado desde el servidor remoto al local
  		try{
  			await ssh.getFile(bckupLog.localFilePath,bckupLog.remoteFilePath);
  		} catch(error){
  			console.log(error)
  			return res.status(500).send({error: "Error al descargar el archivo desde el servidor remoto a la backend"})
  		}

  		//Guardamos el log en la base de datos.
  		try{
  			await bckupLog.save();
  		} catch(error){
  			console.log(error);
  			return res.status(500).send({error: "Error al generar el log del backup"});
  		}

  		//Borrarmos el archivo del servidor remoto para no dejar rastros en el.
  		try{
  			await ssh.execCommand("rm "+bckupLog.remoteFilePath,{})
  		} catch(error){
  			console.log(error);
  			return res.status(500).send({error: "Error al generar el log del backup"});
  		}
		

  		//Subimos le archivo de la ruta local del backend al ftp almacén
  		try{
  			await ftpLocal.connect({host: '192.168.1.240', port: 21, user: "mantenimiento", password: "mant2018!"});
  			//Generación de las rutas dentro del servidor de mantenimiento
  			let newPathFTP = bckupLog.localFilePath.split('/');
  				
  			await ftpLocal.mkdir("mantenimiento/"+newPathFTP[0]+'/'+newPathFTP[1]+'/'+newPathFTP[2]+'/'+newPathFTP[3]+'/',true,()=>{})
  			await ftpLocal.put(bckupLog.localFilePath,"mantenimiento/"+newPathFTP[0]+'/'+newPathFTP[1]+'/'+newPathFTP[2]+'/'+newPathFTP[3]+'/'+newPathFTP[4],()=>{})

  		} catch(error){
  			console.log(error);
  			return res.status(500).send({error: "Error al conectarse al ftp local"});
  		}
  		

		ssh.dispose();
		ftpLocal.end();

		return res.status(200).send({message : "Archivo descargado y subido al FTP almacén"});
	},

	listBackups: (req,res)=>{
		let path = req.body.alias+'/'+req.body.database+'/';
		recursive(path,(err,files)=>{
			return res.status(200).send({files : files});
		})
	},

	addAutoBackup: (req,res)=>{
		let autoServer = new AutoServerModel();
		autoServer.target = req.body._id;
		autoServer.save((err,autoServerSaved)=>{
			if(err) return res.status(500).send({error : "Se ha producido un error al agregar a la tabla autoServer"});
			return res.status(200).send({autoServerSaved : autoServerSaved});
		})
	},

	checkIfAutoBackup:(req,res)=>{
		AutoServerModel.find({target: req.body._id},{},{},(err,autoServerFound)=>{
			if(err) return res.status(500).send({error : "Se ha producido un error al buscar en la tabla autoServer"});
			if (!autoServerFound) return res.status(404).send({error: "No se ha podido encontrar el servidor en autoServer"});
			return res.status(200).send({autoServerFound: autoServerFound});
		});
	},

	delAutoBackup: (req,res)=>{
		AutoServerModel.deleteOne({target : req.body._id},(err,autoServerDeleted)=>{
			if(err) return res.status(500).send({error : "Se ha producido un error al eliminar de la tabla autoServer"});
			if (!autoServerDeleted) return res.status(404).send({error: "No se ha podido encontrar el servidor a borrar de autoServer"});
			return res.status(200).send({autoServerDeleted: autoServerDeleted});
		});
	}

}

module.exports = controller;