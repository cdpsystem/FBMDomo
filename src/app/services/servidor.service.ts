import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Config } from '../models/config';

@Injectable()
export class ServidorService{
	public url: string;
	
	constructor(
	 public _http: HttpClient
	) {
		this.url = Config.backendIp+":"+Config.backendPort;
		this.getServerList();
	}

	getServerList(): Observable<any>{
		let headers = new HttpHeaders()
			.set('Content-Type','application/json')			
			return this._http.get(this.url+"/api/get-servers",{headers : headers});
	}

	getServerLog(serverIp:string,serverDatabase:string): Observable<any>{
		let headers = new HttpHeaders()
			.set('Content-Type','application/json');
		return this._http.get(this.url+'/api/get-server-log/'+serverIp+'/'+serverDatabase,{headers: headers});
	}

	getServer(serverId:string): Observable<any>{
		let params = JSON.stringify(serverId);
		let headers = new HttpHeaders()
			.set('Content-Type','application/json');
		return this._http.post(this.url+'/api/get-server',serverId,{headers: headers});
	}

	getUsers(): Observable<any>{
		return this._http.get(this.url+'/api/users/2');
	}

	updateServidor(servidor):Observable<any>{
		let params = JSON.stringify(servidor);
		let headers = new HttpHeaders()
			.set('Content-Type','application/json');
		return this._http.put(this.url+'/api/update-server/'+servidor._id,params,{headers: headers});
	}

	addServidor(servidor): Observable<any>{
		let params = JSON.stringify(servidor);
		let headers = new HttpHeaders()
			.set('Content-Type','application/json');
		return this._http.post(this.url+'/api/add-server',params,{headers: headers});
	}

	delServidor(servidor): Observable<any>{
		let params = JSON.stringify(servidor);
		let headers = new HttpHeaders()
			.set('Content-Type','application/json');
		return this._http.post(this.url+'/api/delete-server',params,{headers: headers});
	}

	addSkiptable(skiptable): Observable<any>{
		let params = JSON.stringify(skiptable);
		let headers = new HttpHeaders()
			.set('Content-Type','application/json');
		return this._http.post(this.url+'/api/skiptables/add',params,{headers: headers})
	}

	deleteSkiptableItem(skiptableArray,skiptableToDelete):Observable<any>{
		let params = JSON.stringify(skiptableArray);
		let headers = new HttpHeaders()
			.set('Content-Type','application/json');
		return this._http.post(this.url+'/api/skiptables/delete/'+skiptableToDelete,params,{headers: headers})
	}

	getServerSkiptables(servidorid:string):Observable<any>{
		let headers = new HttpHeaders()
			.set('Content-Type','application/json');
		return this._http.get(this.url+'/api/skiptables/'+servidorid);
	}

	getServerFBMDomoVersion(servidor):Observable<any>{
		let params = JSON.stringify(servidor);
		let headers = new HttpHeaders()
			.set('Content-Type','application/json');
		return this._http.post(this.url+'/api/version',params,{headers: headers});
	}

	getInstallableFBMDomoVersion():Observable<any>{
		let headers = new HttpHeaders()
			.set('Content-Type','application/json');
		return this._http.get(this.url+'/api/localversion',{headers: headers});
	}

	FBMDomoInstall(servidor):Observable<any>{
		let params = JSON.stringify(servidor);
		let headers = new HttpHeaders()
			.set('Content-Type','application/json');
		return this._http.post(this.url+'/api/fbmdomoinstall',params,{headers: headers});
	}
	uninstallFBMDomo(servidor):Observable<any>{
		let params = JSON.stringify(servidor);
		let headers = new HttpHeaders()
			.set('Content-Type','application/json');
		return this._http.post(this.url+'/api/uninstall',params,{headers: headers});	
	}
	getResume():Observable<any>{
		let headers = new HttpHeaders()
			.set('Content-Type','application/json');
		return this._http.get(this.url+'/api/resume',{headers: headers});
	}
	getServerInfo(servidor):Observable<any>{
		let params = JSON.stringify(servidor);
		let headers = new HttpHeaders()
			.set('Content-Type','application/json');
		return this._http.post(this.url+'/api/serverinfo',params,{headers: headers});
	}
}