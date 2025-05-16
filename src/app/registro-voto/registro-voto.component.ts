import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro-voto',
  imports: [],
  templateUrl: './registro-voto.component.html',
  styleUrl: './registro-voto.component.css',
  template:`
      
    `
})
export class RegistroVotoComponent {

    constructor(private router: Router) {}
    ngOnInit(): void {
    setTimeout(() => {
      this.router.navigate(['/home']); // Cambia '/home' por la ruta deseada
    }, 10000); // 5000 milisegundos = 5 segundos
}
}
