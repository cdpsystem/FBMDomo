import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params} from '@angular/router';

import { BackupService } from '../services/backup.service';

@Component({
  selector: 'test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css'],
  providers: [BackupService]
})

export class TestComponent implements OnInit {


	public test: any;
  public asdf:string = "hola mundo desde otro component";
	constructor(
		private _backupService: BackupService
		) { }

  	ngOnInit() {  

  	}

}
