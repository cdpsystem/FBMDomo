import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params} from '@angular/router';

import { Servidor } from '../models/servidor';
import { ServidorService } from '../services/servidor.service';

@Component({
  selector: 'sql-viewer',
  templateUrl: './sql-viewer.component.html',
  styleUrls: ['./sql-viewer.component.css'],
  providers: [ServidorService]
})
export class SQLViewerComponent implements OnInit {

	public serverId: string;
	public serverList: any;

	public lastServerAlias: string;
	public lastServerDatabase: string;

	constructor(
		private _route: ActivatedRoute,
		private _router: Router,
	 	private _servidorService: ServidorService
	){}

	ngOnInit(){
		this.getServerList();
	}

	gotoServer(alias,database,id){
		this.lastServerAlias = alias;
		this.lastServerDatabase = database;
		this.serverId = id;
		this._router.navigate(["sqlviewer/"+alias+"/"+database+"/"+id]);
	}

	redirectAddServidor(){

		this._router.navigate(['server/agregar-servidor']);
	}

  	getServerList(){

	  	this._servidorService.getServerList().subscribe(
	  		response =>{
	  			this.serverList = response.server;	  					  		
	  		},
	  		error =>{console.log(<any>error);}
		);
	  }
}
