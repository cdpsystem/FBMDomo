'use strict'

//Mysql
let mysql = require('mysql2');

let controller = {

	sqlInfo: async(req,res)=>{
		let servidor = req.body;
		let sql = "";
		let respuestaHelper = {};
		let respuesta = {};
		let arrayHelper= [];

		
		let con = mysql.createConnection({host: servidor.ip, user: servidor.userDB, password: servidor.passDB});

		//Conexión
		try{ await con.connect(); }
		catch (err){ return res.status(500).send({err: err}); }

		//SQL - Tablas
		sql = `
			SELECT TABLE_NAME 
			FROM INFORMATION_SCHEMA.TABLES
			WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA='${servidor.database}' 
		`;
		try{ respuestaHelper.tablename = await con.promise().query(sql); }
		catch(err)	{ return res.status(500).send({err: err}); }

		for(let i = 0 ; i < respuestaHelper.tablename[0].length; i++){
			//Para que sea mas facil
			let tablename = respuestaHelper.tablename[0][i].TABLE_NAME;

			//SQL - Nº Columnas > Tabla
			sql = `
				SELECT COUNT(*) 
				FROM INFORMATION_SCHEMA.COLUMNS 
				WHERE TABLE_SCHEMA='${servidor.database}' 
	    		AND TABLE_NAME='${tablename}'
			`
			try{ respuestaHelper.columnCount = await con.promise().query(sql); }
			catch(err)	{ return res.status(500).send({err: err}); }
			let columnCount = respuestaHelper.columnCount[0][0]["COUNT(*)"];
			//SQL - Nº Columnas > Tabla

			arrayHelper.push([tablename,columnCount]);
		}
		respuesta.table = arrayHelper;
		//FIN SQL - Tablas

		
			
		return res.status(200).send({message: respuesta});
		
	}
}



module.exports = controller;