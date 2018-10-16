import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params} from '@angular/router';
import { ServidorService } from '../services/servidor.service';
import { BackupService } from '../services/backup.service';
import { Skiptable } from '../models/skiptable';
declare var hola:any;
@Component({
  selector: 'editar-servidor',
  templateUrl: './editar-servidor.component.html',
  styleUrls: ['./editar-servidor.component.css'],
  providers: [ServidorService,BackupService]
})
export class EditarServidorComponent implements OnInit {

	public serverId: string;
	public serverList:any;
	public servidor: any;

  public skiptable: any;
  public newSkiptable: string[] = [""];

  public logArray: any;
  public logVisible=false;
  public logToInfo:any;
  public skiptablesArray: any;
  public FBMDomoVersion:any;
  public FBMDomoInstallableVersion:any;
  public backupFilesArray:any;
  public isAutoServer = false;
  public serverInfoSpace:any;
  public serverInfoProviders:any;


  public loading:boolean = true;
  public edit:boolean = false;
  public doubleBlock = false;

  public opcion:string="";
  public contadorOperaciones = 0;

  constructor(
  	private _route: ActivatedRoute,
	  private _router: Router,
 	  private _servidorService: ServidorService,
    private _BackupService: BackupService
  ) { 
      this.skiptable = {
        'target' : '',
        'arrSkiptable': ['']
      } 
    }

  ngOnInit() {
  	this._route.params.subscribe((params: Params) =>{	
      this.serverInfoProviders = {};
		  this.getServer(params.id);
      this.loading = false;

	  });
  }

  onSubmit(form){
  	this._servidorService.updateServidor(this.servidor).subscribe(
  		response =>{
        this._router.navigate(['/server/'+this.servidor.alias+'/'+this.servidor.database+'/'+this.servidor._id]);
        this.edit = false;
  		},
  		error =>{console.log(error);}
	  );
  }

  getServerSkiptables(){
    this._servidorService.getServerSkiptables(this.servidor._id).subscribe(
        response => {          
          this.skiptablesArray = response.skiptables[0];
        },
        error => {console.log(error);}
      )
  }

  addSkiptable(form){
    this.skiptable.arrSkiptable = this.newSkiptable;
    this.skiptable.target = this.servidor._id;
    this._servidorService.addSkiptable(this.skiptable).subscribe(
        response =>{
          this.getServerSkiptables();
          form.reset();
        },
        error =>{console.log(error);}
      );
  }

  deleteSkiptableItem(item){
    this._servidorService.deleteSkiptableItem(this.skiptablesArray,item).subscribe(
        response =>{
          this.getServerSkiptables();
        },
        error =>{console.log(error);}
      );
  }

  getServer(serverId){
  	this._servidorService.getServer( <any>{'_id' : serverId} ).subscribe(
      	response =>{
      		this.servidor = response.server;
          this.getServerLog();
          this.getServerSkiptables();
          this.getServerFBMDomoInstalledVersion();
          this.getInstallableFBMDomoVersion();
          this.getBackupFilesList();
          this.checkIfAutoServer();
		},
  		error => {console.log(error)}
  	);
  }

  getServerLog(){    
    this._servidorService.getServerLog(this.servidor.ip,this.servidor.database).subscribe(
        response =>{
          this.logArray = response.serverlog;
        },
        error =>{console.log(error);}
      );
  }

  displayServerLog(i){
    this.logToInfo = this.logArray[i].log;
    this.logVisible = true;
  }

  delServer(form){
    this._servidorService.delServidor(this.servidor).subscribe(
        response =>{                   
          this._router.navigate(['/server']);
        },
        error =>{console.log(error);}
      );
  }

  createBackUp(type:string,trigger:string){
    this.loading = true;
    this.contadorOperaciones++;
    this._BackupService.createBackup(this.servidor,type,trigger).subscribe(
      response =>{ 
        console.log(response);
        this.contadorOperaciones--;
        this.getServerLog();
        if(this.contadorOperaciones == 0){
          this.loading = false;
          this.doubleBlock = false;
        } 
      },error=>{console.log(error)}
    );
  }

  checkIfAutoServer(){
    this._BackupService.checkIfAutoServer(this.servidor).subscribe(
        response =>{
          if(response.autoServerFound.length > 0){
            this.isAutoServer = true;
          }else{
            this.isAutoServer = false;
          }
        },
        err =>{console.log(err);}

      )
  }

  addAutoServer(){
    this._BackupService.addAutoServer(this.servidor).subscribe(
        response =>{
            this.isAutoServer = true;         
        },
        err =>{console.log(err);}

      )
  }

  deleteAutoServer(){
    this._BackupService.deleteAutoServer(this.servidor).subscribe(
        response =>{
            this.isAutoServer = false;         
        },
        err =>{console.log(err);}

      )
  }

  createFullBackup(){
    if(!this.loading){
      this.createBackUp("structure","manual");
      this.createBackUp("data","manual");  
    }
  }

  getBackupFilesList(){
    this._BackupService.listBackups(this.servidor).subscribe(
        response => {
          this.backupFilesArray = response;
        },
        error => {console.log(error);}

      );
    
  }


  getServerFBMDomoInstalledVersion(){
    this._servidorService.getServerFBMDomoVersion(this.servidor).subscribe(
       response =>{
          this.FBMDomoVersion = response.version;

          //Comprobaciones de funciones por versiones
          parseFloat(this.FBMDomoVersion) >= 1.4 ?  this.getServerInfo() : console.log("Evaluacion del servidor no soportado. Version >= 1.4 Beta");  

       },
       error => {console.log(error);}
      );
  }

  getInstallableFBMDomoVersion(){
    this._servidorService.getInstallableFBMDomoVersion().subscribe(
       response =>{
          this.FBMDomoInstallableVersion = response.version;
       },
       error => {console.log(error);}
      );
  }

  checkIfUpdate(){
    return parseFloat(this.FBMDomoInstallableVersion) > parseFloat(this.FBMDomoVersion) ? 1 : 0;
  }

  FBMDomoInstall(){
    this.loading = true;    
    this._servidorService.FBMDomoInstall(this.servidor).subscribe(
       response =>{
          this.getServerFBMDomoInstalledVersion();
          this.getInstallableFBMDomoVersion();
          this.loading = false;
       },
       error => {console.log(error);}
      );
  }

  uninstallFBMDomo(){
    this.loading = true;    
    this._servidorService.uninstallFBMDomo(this.servidor).subscribe(
       response =>{
          this.getServerFBMDomoInstalledVersion();
          this.getInstallableFBMDomoVersion();
          this.loading = false;
       },
       error => {console.log(error);}
      );
  }

  getServerInfo(){
    this._servidorService.getServerInfo(this.servidor).subscribe(
      response =>{
         this.serverInfoSpace = response.freeSpace;

         //Filtrar por response de provider
         let providers = response.providers
         let responseStyle = ""
         let formattedProviders;

         providers.forEach((val,index)=>{
           if (val.indexOf("●") >=0){
             responseStyle = "debian";
             return false;
           }
         })

         switch (responseStyle) {
           case "debian":
             this.serverInfoProviders = {};
             providers.forEach((val,index)=>{
               if ( val.substr(0,17) == "● apache2.service" ){
                 this.serverInfoProviders.apache = providers[index+2];
                 return true;
               }
               if ( val.substr(0,15) == "● nginx.service" ){
                 this.serverInfoProviders.nginx = providers[index+2];
                 return true;
               }
             });
             if(!this.serverInfoProviders.nginx){this.serverInfoProviders.nginx = "No está instalado"}
             if(!this.serverInfoProviders.apache){this.serverInfoProviders.nginx = "No está instalado"}
             
             break;
           
           default:
             providers.forEach((val,index)=>{
               if ( val.substr(0,7).toUpperCase() == "apache2".toUpperCase() ){
                 this.serverInfoProviders.apache = providers[index];
                 return true;
               }
               if ( val.substr(0,5).toUpperCase() == "nginx".toUpperCase() ){
                 this.serverInfoProviders.nginx = providers[index];
                 return true;
               }
             });
             if(!this.serverInfoProviders.nginx){this.serverInfoProviders.nginx = "No está instalado"}
             if(!this.serverInfoProviders.apache){this.serverInfoProviders.nginx = "No está instalado"}
             break;
         }

         
      },
      err => {console.log(err);}
    )
  }

}