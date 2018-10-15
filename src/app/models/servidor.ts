export class Servidor{
	constructor(
		public alias: string,
		public ip: string,
		public userSSH: string,
		public passSSH: string,
		public database: string,
		public userDB: string,
		public passDB: string
		){}
}


/********************************************************************************************** */
	/**Version antigua, equivalente al constructor en uso*/
	/**
	public alias: string;
	public ip: string;
	public userSSH: string;
	public passSSH: string;

	constructor(alias: string, ip: string , userSSH: string,passSSH: string){
		this.alias = alias;
		this.ip = ip;
		this.userSSH = userSSH;
		this.passSSH = passSSH
	}
	*/
/********************************************************************************************** */
