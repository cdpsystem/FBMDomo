import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule} from '@angular/forms';
import { routing, appRoutingProviders } from './app.routing';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { ServidorComponent} from './servidor/servidor.component';
import { HomeComponent } from './home/home.component';
import { MenuComponent } from './menu/menu.component';

import  { CalculadoraPipe } from './pipes/calculadora.pipe';
import { UniquePipe } from './pipes/unique.pipe';
import { AgregarServidorComponent } from './agregar-servidor/agregar-servidor.component';
import { LoadScreenComponent } from './load-screen/load-screen.component';
import { EditarServidorComponent } from './editar-servidor/editar-servidor.component';
import { TestComponent } from './test/test.component';
import { InfoScreenComponent } from './info-screen/info-screen.component';
import { SQLViewerComponent } from './sql-viewer/sql-viewer.component';

@NgModule({
  declarations: [
    AppComponent,
    ServidorComponent,
    HomeComponent,
    MenuComponent,
    CalculadoraPipe,
    UniquePipe,
    AgregarServidorComponent,
    LoadScreenComponent,
    EditarServidorComponent,
    TestComponent,
    InfoScreenComponent,
    SQLViewerComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    routing,
    HttpClientModule
  ],
  providers: [
    appRoutingProviders

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
