import { Component } from '@angular/core';
import { ModuloMapaComponent } from './components/modulo-mapa/modulo-mapa.component';

@Component({
  selector: 'app-root', // Debe llamarse 'app-root'
  standalone: true,
  imports: [ModuloMapaComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'FrontEndAngular';
}