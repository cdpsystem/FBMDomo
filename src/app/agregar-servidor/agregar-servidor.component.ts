import { Component, OnInit } from '@angular/core';
import { Servidor } from '../models/servidor';

//Servicios
import { ServidorService } from '../services/servidor.service';

//Pipes


@Component({
  selector: 'app-agregar-servidor',
  templateUrl: './agregar-servidor.component.html',
  styleUrls: ['./agregar-servidor.component.css'],
  providers: [ServidorService]
})
export class AgregarServidorComponent implements OnInit {

	public servidor: any;
  public isServerAgregado: any;
  public servers: any;
  public listaAlias: String[];

  constructor(private _servidorService: ServidorService) {
    this.servidor = {'alias' : '','ip' : '','userSSH' : '','passSSH' : '','database' : '','userDB' : '','passDB': ''};
    this.listaAlias = [];
    this.servers=[];
  }

  ngOnInit() {
    this.isServerAgregado = false;
    this.getServers();
  }

  getServers(){
    this._servidorService.getServerList().subscribe(
        response=>{
          this.servers = response.server;    
        },
        error =>{console.log(<any>error);}

      );
  }

  setAliasToInput(alias:string,ip:string,userSSH:string,passSSH:string){
    this.servidor.alias = alias;
    this.servidor.ip = ip;
    this.servidor.userSSH = userSSH;
    this.servidor.passSSH = passSSH;
  }

  onSubmit(form){
    this._servidorService.addServidor(this.servidor).subscribe(

      response =>{
        this.isServerAgregado = true;
        setTimeout(()=>{
          this.isServerAgregado = false;
        },1000);
        this.servers.push({alias: response.server.alias});
        this.servers.sort((a,b)=>{
          if (a.alias === b.alias) {
            return 0;
          }else {
            return (a.alias < b.alias) ? -1 : 1;
          }
        })
  			form.reset();
  		},

  		error => {console.log(error)}
  	);
  	
  }

}
