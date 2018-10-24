'use strict'
let NodeSSH = require('node-ssh');
let clientFTP = require('ftp');
let mongoose = require('mongoose');
let moment = require('moment');
let fs = require('fs');
let recursive = require('recursive-readdir');
let cron = require('node-cron');
let Utils = require('../utils/CDP');

let ServerModel = require('../models/server');
let BackupLogModel = require('../models/backuplog');
let SkipTableModel = require('../models/skiptable');
let AutoServerModel = require('../models/autoserver');
let nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});




let cronTask2 = cron.schedule('0 15 11 * * *', 
	async() =>{

//Conexion remota para la gestion de archivos y generación de backups
let ssh = new NodeSSH();
//Conexion local al FTP almacén
let ftpLocal = new clientFTP();
//String limpio para la creación del comando
let comando = "";
//String con el path local del archivo
let localPath = "";
console.log("Comenzando backup automática");
//Obtenemos la lista de autoServers
try{
	let autoServerFound = await AutoServerModel.find({},{},{})
	if ( autoServerFound.length > 0 ){
		// autoServerFound.forEach(async(autoServerItem,index)=>{
		Utils.asyncForEach(autoServerFound, async(autoServerItem,index)=>{
			let server = await ServerModel.findById(autoServerItem.target);
			let bckupLog = new BackupLogModel();
				//Rellenamos bckupLog con lo que tenemos por ahora
				bckupLog.alias = server.alias;
				bckupLog.ip = server.ip;
				bckupLog.backupDate = Date.now();
				bckupLog.database = server.database;
				bckupLog.trigger = "auto";


				let serverIpArray = server.ip.split(":");
				if(serverIpArray.length == 1){
					serverIpArray[1] = 22;
				}

				let strSkipTables = "";
				try {
			    	let skpTables = await SkipTableModel.find({target: server._id},{},{});
				    if(skpTables.length > 0){
						skpTables[0].arrSkiptables.forEach((skiptable)=>{
							strSkipTables+=server.database + '.' + skiptable+'¿';
						});
					}				
				} catch (error) {
					console.log('There was an error: ', error);
					return -1;
				}

				//Eliminamos el ultimo ¿ que sobra
				strSkipTables=strSkipTables.slice(0,-1);

				for(let i= 0; i <= 1; i ++){

					if (i == 0){
						bckupLog.type="structure";
						comando = 'fbmdomo_backup2 --'+bckupLog.type+' '+server.database+' '+server.userDB+' '+server.passDB;
					}else{
						bckupLog.type="data"
						comando = 'fbmdomo_backup2 --'+bckupLog.type+' '+server.database+' '+server.userDB+' '+server.passDB + ' ' + strSkipTables;
					}
					console.log(' ');
					console.log("Comenzando backup automatica de " +server.alias + "( "+server.database+" ) de tipo " + bckupLog.type);

					//Realizamos la conexion con el host y generamos la backup
					try{	
						await ssh.connect({host: serverIpArray[0], port: serverIpArray[1], username: server.userSSH, password: server.passSSH});
						let stdout =  (await ssh.execCommand(comando, { cwd:'${HOME}/fbmdomo/' })).stdout.split("\n");
						bckupLog.remoteFilePath = stdout[4];
							bckupLog.log = stdout.slice(5);	
						
					}catch (error){
						console.log(error);
						return -1;
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
						return -1;
					}

					//Guardamos el log en la base de datos.
					try{
						await bckupLog.save();
					} catch(error){
						console.log(error);
						return -1;
					}

					//Borrarmos el archivo del servidor remoto para no dejar rastros en el.
					try{
						await ssh.execCommand("rm "+bckupLog.remoteFilePath,{})
						
					} catch(error){
						console.log(error);
						return -1;
					}

					
					//Subimos le archivo de la ruta local del backend al ftp almacén
					try{
						await ftpLocal.connect({host: '192.168.1.240', port: 21, user: "mantenimiento", password: "mant2018!"});
						//Generación de las rutas dentro del servidor de mantenimiento
						let newPathFTP = bckupLog.localFilePath.split('/');
							
						await ftpLocal.mkdir("mantenimiento/"+newPathFTP[0]+'/'+newPathFTP[1]+'/'+newPathFTP[2]+'/'+newPathFTP[3]+'/',true,()=>{})
						await ftpLocal.put(bckupLog.localFilePath,"mantenimiento/"+newPathFTP[0]+'/'+newPathFTP[1]+'/'+newPathFTP[2]+'/'+newPathFTP[3]+'/'+newPathFTP[4],()=>{})
						console.log("Terminada backup automatica de " +server.alias + "( "+server.database+" ) de tipo " + bckupLog.type);
						var mailOptions = {
						  from: process.env.MAIL_FROM,
						  to: process.env.MAIL_TO,
						  subject: 'BACKUP STATUS - OK',
						  text: "Terminada backup automatica de " +server.alias + "( "+server.database+" ) de tipo " + bckupLog.type
						};
						await transporter.sendMail(mailOptions, function(error, info){
						  if (error) {
						    console.log(error);
						  } else {
						    console.log('Email sent: ' + info.response);
						  }
						}); 
					} catch(error){
						console.log(error);
						return -1;
					}
					

				}

		})
	}else{
		return 0;
	}
} catch(error){
	console.log(error);
}
});


let controller = {}

module.exports = controller;