import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params} from '@angular/router';
import { ServidorService } from '../../services/servidor.service';
import { SqlViewerService } from '../../services/sql-viewer.service';

@Component({
  selector: 'sql-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.css'],
  providers: [ServidorService , SqlViewerService]
})
export class ViewerComponent implements OnInit {

	//Control cargando
	public loaded = false;
	public firstSearch = false;

	//urlVariables
	public serverAlias;
	public serverDatabase;
	public serverId;

	//Servidor
	public servidor:any;

	//datos extraidos
		//Nombr Tablas
		public tables:Array<any>;


  	constructor(
  		private _route: ActivatedRoute,
  		private _SQLViewer: SqlViewerService,
  		private _servidorService: ServidorService
	){ 
  		
  	}

	ngOnInit() {
		//Obtenemos los parámetros de la url
		this._route.params.subscribe((params: Params) =>{
			this.loaded = false;
			this.firstSearch = true;
			this.serverAlias = params.alias;
			this.serverDatabase = params.database;
			this.serverId = params.id;
			//Ya se tiene la id del server;
			this.getServer()
		});
	}

	getServer(){
		this._servidorService.getServer( <any>{'_id' : this.serverId} ).subscribe(
      	response =>{
      		this.servidor = response.server;
      		//Aqui van todos los métodos que requieran del servidor.
      		this.sqlInfo();
          
		},
  		error => {console.log(error)}
  	);
  }

	

	sqlInfo(){
		this._SQLViewer.sqlInfo(this.servidor).subscribe(
			response => {	
				console.log(response);			
				this.tables = response.message.table;
				this.loaded =true;
			},
			err => {console.log(err)}
		)
	}



}
