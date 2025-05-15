// src/app/servicios/mi-api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MiApiService {
  private apiUrl = 'https://api.digital.gob.do/v3/cedulas/{cedula}/validate';

  constructor(private http: HttpClient) {}

  obtenerDatos(cedula: string): Observable<any> {
    const url = `https://api.ejemplo.com/usuarios/${cedula}/detalles`;
    return this.http.get(url);
  }

  enviarDatos(payload: any): Observable<any> {
    return this.http.post(this.apiUrl, payload);
  }
}
