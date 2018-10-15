import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params} from '@angular/router';
import { SqlViewerService } from '../../services/sql-viewer.service';
@Component({
  selector: 'sql-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.css'],
  providers: [SqlViewerService]
})
export class ViewerComponent implements OnInit {

	//urlVariables
	public serverAlias;
	public serverDatabase;
	public serverId;
  	constructor(
  		private _route: ActivatedRoute,
  		private _SQLViewer: SqlViewerService
	){ 

  	}

	ngOnInit() {
		//Obtenemos los parámetros de la url
		this._route.params.subscribe((params: Params) =>{
			this.serverAlias = params.alias;
			this.serverDatabase = params.database;
			this.serverId = params.id;
		});


	}



}
