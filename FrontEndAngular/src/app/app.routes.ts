import { Routes } from '@angular/router';
import { IngresoComponent } from './components/modulo-ingreso/modulo-ingreso.component';

export const routes: Routes = [
  //@javi: ruta de modulo de ingreso
  { 
    path: 'ingreso', 
    component: IngresoComponent 
  },
  //Redirección por defecto
  { 
    path: '', 
    redirectTo: 'ingreso', 
    pathMatch: 'full' 
  }
];