import { Routes } from '@angular/router';
import { HomeComponent} from './app.home.component';
import {RegistroVotoComponent} from './registro-voto/registro-voto.component';

export const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'registro', component: RegistroVotoComponent}
];
