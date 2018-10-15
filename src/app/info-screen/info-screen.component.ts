import { Component, Input,Output,EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'info-screen',
  templateUrl: './info-screen.component.html',
  styleUrls: ['./info-screen.component.css']
})
export class InfoScreenComponent implements OnInit {
	
	private _info:string = "";
  private _visible:boolean=false;

  	constructor() { }

  	ngOnInit() {
  		
  	}

  	@Input()
  	set info(info: any){
  		this._info = info;
  	}

    @Input()
     set visible(visible:boolean){
       this._visible = visible;
     }
     @Output() cerrarLog = new EventEmitter();


     fireCerrarLog(event){
       this._visible = false;
       this.cerrarLog.emit(this._visible);
     }

}
