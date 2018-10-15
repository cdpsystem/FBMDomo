//Importar modulos router angular
import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//Importar componentes
import { ServidorComponent } from './servidor/servidor.component';
import { HomeComponent } from './home/home.component';
import { AgregarServidorComponent } from './agregar-servidor/agregar-servidor.component';
import { TestComponent } from './test/test.component';
import { SQLViewerComponent } from './sql-viewer/sql-viewer.component';
import { ViewerComponent } from  './sql-viewer/viewer/viewer.component';

//Array configuracion rutas


const appRoutes: Routes = [
	{path: '', component: HomeComponent},
	{path: 'home', component: HomeComponent},
	{path: 'server', component: ServidorComponent},
	{	path: 'server/:alias/:database/:id', 
		component: ServidorComponent,		
   		runGuardsAndResolvers: 'always'
   	},
	{path: 'server/agregar-servidor',component: AgregarServidorComponent},

	//** Borrar en produccion - deleteonproduction **//
	{path: 'test',component : TestComponent},


	//SQL Viewer
	{path: 'sqlviewer',component: SQLViewerComponent,children:[
		{path: '', redirectTo: '', pathMatch: 'full'},
		{path: ':server/:user/:pass', component: ViewerComponent }

	]},

	//** Es la ruta 404 DEBE ser siempre la última
	{path: '**' , component: HomeComponent}
];

//Necesario para que funcionen las rutas
export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes,{onSameUrlNavigation: 'reload'});

