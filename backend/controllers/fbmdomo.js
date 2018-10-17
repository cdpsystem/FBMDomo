'use strict'
let NodeSSH = require('node-ssh');
let fs = require('fs');


let comando = "fbmdomo_backup2 --version";
let scriptName = "fbmdomo_backup2";
let remotePath = "/usr/bin/";

let controller = {
	getVersion: (req,res)=>{
		let ssh = new NodeSSH();

		console.log(req.body);

		//get Puerto
		let serverIpArray = req.body.ip.split(":");
		if(serverIpArray.length == 1){
			serverIpArray[1] = 22;
		}

		ssh.connect({
			host: serverIpArray[0], 
			port: serverIpArray[1], 
			username: req.body.userSSH,
			password: req.body.passSSH ,
			debug : console.log,
			readyTimeout : 99999
		})
			.then( 
				()=>{
					ssh.execCommand(comando, { cwd:'${HOME}/fbmdomo/' }).then(
						(result) => {
							console.log(result);
							return res.status(200).send({version: result.stdout})
						}
					);
				}
			)
			.catch(
				(err)=>{
					console.log("Error al obtener la versión");
					console.log(err);
					return res.status(500).send({err: err});
				}
			);
	},

	getLocalVersion: (req,res)=>{
		fs.readFile(scriptName,(err,data)=>{
			if(err) return res.status(500).send({error: "Error al abrir el archivo"});
			let archivo = ""+data;
			archivo = archivo.split("\n");
			let version = (archivo[7]).split("\"")[1];
			
			return res.status(200).send({version: version });
		})
	},

	install: (req,res)=>{
		let ssh = new NodeSSH();

		//get Puerto
		let serverIpArray = req.body.ip.split(":");
		if(serverIpArray.length == 1){
			serverIpArray[1] = 22;
		}
		ssh.connect({
			host: serverIpArray[0], 
			port: serverIpArray[1], 
			username: req.body.userSSH,
			password: req.body.passSSH 
		})
			.then( 
				()=>{
					console.log("Conectado");
					ssh.putFile(scriptName,remotePath + scriptName)
						.then(
							()=>{
								console.log("Archivo Movido");
								ssh.execCommand( "chmod +x " + remotePath+scriptName,{})
									.then(
										()=>{
											return res.status(200).send({message: "FBMDomo Instalado / Reinstalado"});
										},
										error => {
											console.log(error);
											return res.status(500).send({message: "Error al aplicarle los permisos a FBMDomo",error: error});
										}
									);
							},
							error => {
								console.log(error);
								return res.status(500).send({message: "Error al actualizar FBMDomo",error: error});
							}
						);
				}
			);
	},
	
	uninstall: (req,res)=>{
		let ssh = new NodeSSH();

		//get Puerto
		let serverIpArray = req.body.ip.split(":");
		if(serverIpArray.length == 1){
			serverIpArray[1] = 22;
		}

		ssh.connect({
			host: serverIpArray[0], 
			port: serverIpArray[1], 
			username: req.body.userSSH,
			password: req.body.passSSH 
		})
			.then(
				() =>{
					ssh.execCommand("rm " + remotePath+scriptName)
						.then(
							()=>{
								return res.status(200).send({message: "FBMDomo desinstalado correctamente"});
							}
						);
				},
				error =>{
					return res.status(500).send({message: "Error al desinstalar FBMDomo del servidor",error: error});
				}
			);
	}

}

module.exports = controller;