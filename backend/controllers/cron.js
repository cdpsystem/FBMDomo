'use strict'
let NodeSSH = require('node-ssh');
let clientFTP = require('ftp');
let mongoose = require('mongoose');
let moment = require('moment');
let fs = require('fs');
let recursive = require('recursive-readdir');
let cron = require('node-cron');

let ServerModel = require('../models/server');
let BackupLogModel = require('../models/backuplog');
let SkipTableModel = require('../models/skiptable');
let AutoServerModel = require('../models/autoserver');

let cronTask2 = cron.schedule('10 1 15 * * *', 
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
		autoServerFound.forEach(async(autoServerItem,index)=>{
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

					console.log("Comenzando backup automatica de " +server.alias + "( "+server.database+" ) de tipo " + bckupLog.type);

					//Realizamos la conexion con el host y generamos la backup
					try{	
						console.log("IP y puerto -> " + serverIpArray[0] + ":" +serverIpArray[1])		;
						console.log("username -> " + server.userSSH);
						console.log("pass -> " + server.passSSH);
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
						console.log(bckupLog.type);
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

					} catch(error){
						console.log(error);
						return -1;
					}

					ftpLocal.end();
				}

		})
	}else{
		return 0;
	}
} catch(error){
	console.log(error);
}
});
/**
let cronTask = cron.schedule('0 57 17 * * *',() =>{
	AutoServerModel.find({},{},{},
		(err,autoServerList)=>{
			//Comprobar que haya tablas registradas para auto backup
			if(autoServerList.length > 0){								
				//Comprobar que se haya cargado NodeSSH Correctamente
				if(!NodeSSH){
					console.log("Error al obtener el modulo SSH");
				}else{
					let ssh = new NodeSSH();
					let ftpLocal = new clientFTP();
					console.log("Empezando carga de backup automática");					
					//Todo bien, comencemos

					//Recorremos la lista de servidores
					autoServerList.forEach(
						(autoServerItem,index)=>{
							//Obtenemos la informacion de los servidores
							ServerModel.findById(autoServerItem.target,
								(err,server)=>{

									//Obtenemos el puerto de la ip
									let serverIpArray = server.ip.split(":");
									if(serverIpArray.length == 1){
										serverIpArray[1] = 22;
									}

									//Obtenemos la lista de las skiptables para este servidor
									let skipTables="";
									SkipTableModel.find({target: server._id},{},{},
										(err,skipTablesFound)=>{										
											if(skipTablesFound.length > 0){
												skipTablesFound[0].arrSkiptables.forEach((a)=>{
													skipTables+=server.database + '.' + a+'¿';
												});
											}
											//Se prepara el string para crear el comando fbmdomo
											skipTables=skipTables.slice(0,-1);
											
											let comando = 'fbmdomo_backup2 --data '+server.database+' '+server.userDB+' '+server.passDB + ' ' + skipTables;
											let strLogArray = [];
											//Comenzamos la conexion
											ssh.connect({host: serverIpArray[0], port: serverIpArray[1], username: server.userSSH, password: server.passSSH})
												.then( 
													()=>{
														ssh.execCommand(comando,{})
															.then(
																(result)=>{
																	//Formateamos el stdout
																	strLogArray = (result.stdout).split("\n");																		
																	//Preparamos el model para guardar el log de la copia
																	let backuplog = new BackupLogModel();

																	backuplog.alias = server.alias;
																	backuplog.ip = server.ip;
																	backuplog.backupDate = Date.now();
																	backuplog.database = server.database;
																	backuplog.remoteFilePath = strLogArray[4];
															  		backuplog.trigger = "auto";
															  		backuplog.type = "data";
															  		backuplog.log = strLogArray.slice(5);

															  		//Comprobamos si existe la carpeta y si no la creamos	
															  		let localPath = "backups/"+backuplog.alias+"/";
															  		if(!fs.existsSync(localPath)) fs.mkdirSync(localPath);
															  								  		
															  		localPath += backuplog.database+'/';
															  		if(!fs.existsSync(localPath))fs.mkdirSync(localPath);																  		

															  		localPath += moment.unix(backuplog.backupDate / 1000).format('DD-MM-YYYY')+'/';
															  		if(!fs.existsSync(localPath))fs.mkdirSync(localPath);
															  					  	
															  		//Le damos el nombre al archivo
															  		localPath = localPath+Math.trunc(backuplog.backupDate/100)+'_'+backuplog.database+'_'+backuplog.type+'.sql';
															  		backuplog.localFilePath= localPath;					

															  		ssh.getFile(localPath, backuplog.remoteFilePath)
																		.then(
																			function(Contents) {
																				console.log("The File's contents were successfully downloaded")
																				console.log(backuplog.localFilePath);
																				console.log(backuplog.remoteFilePath);
																			  	ftpLocal.on('ready', function() {
																			  		let newPathFTP = backuplog.localFilePath.split('/');
																			  		console.log(newPathFTP);
																			  		ftpLocal.mkdir("mantenimiento/"+newPathFTP[0]+'/'+newPathFTP[1]+'/'+newPathFTP[2]+'/'+newPathFTP[3]+'/',true,()=>{
																				    	ftpLocal.put(backuplog.localFilePath,"mantenimiento/"+newPathFTP[0]+'/'+newPathFTP[1]+'/'+newPathFTP[2]+'/'+newPathFTP[3]+'/'+newPathFTP[4], function(err) {
																				      		if (err) throw err;												      	
																							ssh.execCommand("rm "+backuplog.remoteFilePath,{})
															    							.then(function(result2){
															    								console.log("Archivo Borrado");

																								backuplog.save((err,backupLogStored)=>{
	
																						  		});
													    									});						    						

																					      	
																					    });											  			
																			  		})

																			  	});

																			 	ftpLocal.connect({host: '192.168.1.240', port: 21, user: "mantenimiento", password: "mant2018!"});			    											    					
													  						}, 
													  						function(error) {
													    						console.log("Something's wrong")
													    						console.log(error)
													  						}
													  					)

																}

															)
														comando = 'fbmdomo_backup2 --structure '+server.database+' '+server.userDB+' '+server.passDB;
														ssh.execCommand(comando,{})
															.then(
																(result)=>{
																	//Formateamos el stdout
																	strLogArray = (result.stdout).split("\n");																		
																	//Preparamos el model para guardar el log de la copia
																	let backuplog = new BackupLogModel();

																	backuplog.alias = server.alias;
																	backuplog.ip = server.ip;
																	backuplog.backupDate = Date.now();
																	backuplog.database = server.database;
																	backuplog.remoteFilePath = strLogArray[4];
															  		backuplog.trigger = "auto";
															  		backuplog.type = "structure";
															  		backuplog.log = strLogArray.slice(5);

															  		//Comprobamos si existe la carpeta y si no la creamos	
															  		let localPath = "backups/"+backuplog.alias+"/";
															  		if(!fs.existsSync(localPath)) fs.mkdirSync(localPath);
															  								  		
															  		localPath += backuplog.database+'/';
															  		if(!fs.existsSync(localPath))fs.mkdirSync(localPath);																  		

															  		localPath += moment.unix(backuplog.backupDate / 1000).format('DD-MM-YYYY')+'/';
															  		if(!fs.existsSync(localPath))fs.mkdirSync(localPath);
															  					  	
															  		//Le damos el nombre al archivo
															  		localPath = localPath+Math.trunc(backuplog.backupDate/100)+'_'+backuplog.database+'_'+backuplog.type+'.sql';
															  		backuplog.localFilePath= localPath;					

															  		ssh.getFile(localPath, backuplog.remoteFilePath)
																		.then(
																			function(Contents) {
																				console.log("The File's contents were successfully downloaded")
																				console.log(backuplog.localFilePath);
																				console.log(backuplog.remoteFilePath);
																			  	ftpLocal.on('ready', function() {
																			  		let newPathFTP = backuplog.localFilePath.split('/');
																			  		console.log(newPathFTP);
																			  		ftpLocal.mkdir("mantenimiento/"+newPathFTP[0]+'/'+newPathFTP[1]+'/'+newPathFTP[2]+'/'+newPathFTP[3]+'/',true,()=>{
																				    	ftpLocal.put(backuplog.localFilePath,"mantenimiento/"+newPathFTP[0]+'/'+newPathFTP[1]+'/'+newPathFTP[2]+'/'+newPathFTP[3]+'/'+newPathFTP[4], function(err) {
																				      		if (err) throw err;												      	
																							ssh.execCommand("rm "+backuplog.remoteFilePath,{})
															    							.then(function(result2){
															    								console.log("Archivo Borrado");

																								backuplog.save((err,backupLogStored)=>{

																						  		});
													    									});						    						

																					      	
																					    });											  			
																			  		})

																			  	});

																			 	ftpLocal.connect({host: '192.168.1.240', port: 21, user: "mantenimiento", password: "mant2018!"});			    											    					
													  						}, 
													  						function(error) {
													    						console.log("Something's wrong")
													    						console.log(error)
													  						}
													  					)

																}

															)
															

													}
												)
											
										}
									);
					

								}
							);
						}
					);





				}
				
			}

		}
	);
})
*/

let controller = {}

module.exports = controller;