import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ServidorService } from '../services/servidor.service'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [ServidorService]
})
export class HomeComponent implements OnInit {

	public resume;
  public logToInfo:any;
  public logVisible = false;

  constructor(
  	private _router: Router,
  	private _servidorService: ServidorService
  	) {
	  	this._servidorService.getResume().subscribe(
	  		response => {
	  			this.resume = response.returnInfo;
	  		},
	  		err => {console.log(err);}

	  	);
 	}

  ngOnInit() {
  	if (this._router.url === '/'){
  		this._router.navigate(['/home']);
  	}

  }

  displayServerLog(i){
    this.logToInfo = this.resume.lastLogs[i].log;
    this.logVisible = true;
  }

}
