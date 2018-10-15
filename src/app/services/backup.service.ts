import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Config } from '../models/config';


@Injectable()
export class BackupService{
	public url: string;
	
	constructor(
	 public _http: HttpClient
	) {
		this.url = Config.backendIp+":"+Config.backendPort;
	}

	createBackup(servidor,type,trigger): Observable<any>{
		servidor.type=type;
		servidor.trigger=trigger;		
		let params = JSON.stringify(servidor);
		let headers = new HttpHeaders()
			.set('Content-Type','application/json');
		return this._http.post(this.url+'/api/create-backup',params,{headers: headers});
	}

	listBackups(servidor):Observable<any>{
		let params = JSON.stringify(servidor);	
		let headers = new HttpHeaders()
		return this._http.post(this.url+"/api/list-backups",params,{headers: headers})
	}

	addAutoServer(servidor):Observable<any>{
		let params = JSON.stringify(servidor);
		let headers = new HttpHeaders()
			.set('Content-Type','application/json');
		return this._http.post(this.url+'/api/add-autoserver',params,{headers : headers})
	}

	checkIfAutoServer(servidor):Observable<any>{
		let params = JSON.stringify(servidor);
		let headers = new HttpHeaders()
			.set('Content-Type','application/json');
		return this._http.post(this.url+'/api/is-autoserver',params,{headers : headers})
	}

	deleteAutoServer(servidor):Observable<any>{
		let params = JSON.stringify(servidor);
		let headers = new HttpHeaders()
			.set('Content-Type','application/json');
		return this._http.post(this.url+'/api/delete-autoserver',params,{headers : headers})
	}
	
}