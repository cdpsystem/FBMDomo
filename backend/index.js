'use strict'

let mongoose = require('mongoose');
let app = require('./app');

let port = 3700;

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/fbmdomo',{useNewUrlParser: true } )
	.then( ()=>{
		//Conexion realizada correctamente
		console.log("Conexion a FBMDOMO Mongo Database establecida con éxito ...");
		app.listen(port,()=>{
			console.log("Servidor up en -> localhost:3700");
		});
	})
	.catch(err => {
		//Error no se ha podido conectar a la base de datos
		console.log(err);
	}); 