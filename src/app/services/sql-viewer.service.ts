import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Config } from '../models/config';

@Injectable({
  providedIn: 'root'
})
export class SqlViewerService {
	public url: string;
	
	constructor(
	 public _http: HttpClient
	) {
		this.url = Config.backendIp+":"+Config.backendPort;
	}

	//TODO: Obtiene un resumen de la base de datos
	public sqlInfo(){}

	//TODO: Obtiene la lista de las tablas de la base de datos
	public listTables(){}

	//TODO: Obtiene las columnas de una base de datos
	public getColumns(){}

	//TODO Obtiene la información de una base de datos
	public getTableValues(){}



}
