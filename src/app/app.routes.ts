import { Routes } from '@angular/router';
import { HomeComponent} from './app.home.component';
import {RegistroVotoComponent} from './registro-voto/registro-voto.component';

export const routes: Routes = [
    {path: 'home', component: HomeComponent}, // Pagina principal de la votacion
    {path: 'registro', component: RegistroVotoComponent} // Confirmacion de voto para el usuario
];
