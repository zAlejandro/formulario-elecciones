import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms'
import { Firestore, collection, addDoc, query, where, collectionData, getDocs} from '@angular/fire/firestore';
import { CedulaService } from './servicios/cedula.service';
import { catchError, debounce, debounceTime, distinctUntilChanged, map, of, switchMap } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { FirebaseApp } from '@angular/fire/app';
import { Router } from '@angular/router';

declare var bootstrap: any;



@Component({
    standalone: true,
    selector: 'app-home',
    imports: [CommonModule, ReactiveFormsModule, FormsModule],
    template:
    `
    <div class="container-fluid">
        <div class="container">
            <form class="row g-3 needs-validation novalidated">
                <div class="mb-3">
                    <label for="cedulaInput" class="form-label fw-semibold">CÉDULA</label>
                    <input  
                        id="cedulaInput"
                        name="cedula"
                        [(ngModel)]="cedula" 
                        (ngModelChange)="validarCedula()" 
                        type="text" 
                        class="form-control shadow-sm" 
                        placeholder="000-000000-0"  
                        [ngClass]="{
                        'is-valid': cedulaValida,
                        'is-invalid': cedula && !cedulaValida
                        }">

                    <div class="valid-feedback">
                        Cédula válida.
                    </div>
                    <div class="invalid-feedback">
                        Formato inválido. Usa 000-0000000-0
                    </div>
                </div>

                <div class="row">
                <!-- Opción 1 -->
                <div class="col-md-6 mb-4">
                    <div 
                        class="card option-card text-center p-3 h-100 cursor-pointer"
                        [ngClass]="{'border border-info border-4 shadow-lg': voto === 1}"
                        (click)="alternarBorde(1)" >
                        <img [src]="plancha1" class="card-img-top img-fluid mb-3" alt="Plancha 1">
                        <div class="card-body">
                            <h5 class="card-title">Opción 1</h5>
                        </div>
                    </div>
                </div>

                <!-- Opción 2 -->
                <div class="col-md-6 mb-4">
                    <div 
                        class="card option-card text-center p-3 h-100 cursor-pointer"
                        [ngClass]="{'border border-info border-4 shadow-lg': voto === 2}"
                        (click)="alternarBorde(2)">
                        <img [src]="plancha2" class="card-img-top img-fluid mb-3" alt="Plancha 2">
                        <div class="card-body">
                            <h5 class="card-title">Opción 2</h5>
                        </div>
                    </div>
                </div>
            </div>

                <div class="text-center">
                    <button (click)="enviar()" class="btn btn-primary w-25 p-3" [disabled]="cedulaValida !== true" type="submit" disabled>VOTAR</button>
                </div>
            </form>
            <!-- Modal -->
            <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <h1 class="modal-title fs-5" id="exampleModalLabel">CONFIRMAR VOTO</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                    ESTA SEGURO?
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">NO</button>
                    <button id="confirmButton" (click)="confirmarVoto()" type="button" class="btn btn-primary">SI</button>
                  </div>
                </div>
              </div>
            </div>
            <!-- Warning Modal -->
            <div class="modal fade" id="alertModal" tabindex="-1" aria-labelledby="alertModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content border-danger">
                        <div class="modal-header bg-danger text-white">
                            <h5 class="modal-title" id="alertModalLabel">¡Advertencia!</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                        </div>
                        <div class="modal-body">
                            <p><strong>DEBES VOTAR POR UNA PLANCHA PARA CONTINUAR.</strong></p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-light" data-bs-dismiss="modal">Entendido</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
  `
})

export class HomeComponent {
    private fb = inject(FormBuilder);
    private firestore = inject(Firestore);
    private api = inject(CedulaService);
    private router = inject(Router);

    plancha1 = 'https://media.discordapp.net/attachments/753449414361874524/1372588894448652439/PADRON_1.png?ex=68275285&is=68260105&hm=d6113f715387f4d0ed225fadd5ba63b48c336206bba673880211908b182c56f2&=&format=webp&quality=lossless'
    plancha2 = 'https://media.discordapp.net/attachments/753449414361874524/1372588894893244518/PADRON_2.png?ex=68275286&is=68260106&hm=8748a779355abae42b65ebd7cd14573fce263cf686a1b062b68972f32a30494d&=&format=webp&quality=lossless';

    cedula = "";
    voto = 0;

    botonActivo = false;
    modalRef: any;

    abrirModal() {
        const el = document.getElementById('exampleModal');
        console.log(el);
        this.modalRef = new bootstrap.Modal(el);
        this.modalRef.show();
    }

    cerrarModal() {
        this.modalRef?.hide();
    }

    form: FormGroup = this.fb.group({
        nombre: ['', Validators.required],
        cedula: ['', [Validators.required]],
        mensaje: ['', Validators.required]
    });

    mensajeEnviado = signal(false);
    cedulaValida: boolean | false = false;

    resaltado: boolean = false;
    confirmarBoton: boolean = false;

    alternarBorde(id: number) {
        this.voto = id;
        console.log(this.voto);
    }


    async enviar(){
        if(this.voto != 0){
            this.abrirModal();
        }else{
            const el = document.getElementById('alertModal');
            this.modalRef = new bootstrap.Modal(el);
            this.modalRef.show();
        }
    }


    async verificarDuplicado(cedula: string): Promise<boolean>{
        const cedulaRef = collection(this.firestore, 'votantes');
        const q = query(cedulaRef, where('cedula', '==', cedula));
        const snapshot = await getDocs(q);

        return !snapshot.empty;
    }

    confirmarVoto(){
        this.guardarVoto(this.cedula);
    }

    async guardarVoto(cedula: string){
        this.confirmarBoton = true;
        const existe = await this.verificarDuplicado(this.cedula);
        
        const ref = collection(this.firestore, 'votantes');
        const datos = {
            cedula: this.cedula,
            voto: this.voto
        };

        if (existe){
            console.warn("ESTA CEDULA YA HA VOTADO");
            console.log
        }else{
            await addDoc(ref,datos);
            this.concluirVoto();
            this.cerrarModal();
            this.confirmarBoton = false;
        }
    }


    async validarCedula(){
        const votantesRef = collection(this.firestore, 'votantes');
        const q = query(votantesRef, where('cedula', '==', this.cedula));

        collectionData(q).subscribe(data => {
            if (this.cedulaValida == true && data.length == 0){
                this.botonActivo = true;
            }else{
                this.botonActivo = false;
            }
            console.log("valor botonActivo:", this.botonActivo);
        });
        try {
            this.api.obtenerDatos(this.cedula).pipe(
                catchError(err => {
                    this.cedulaValida = false;
                    console.log("valor de cedulaValida: ", this.cedulaValida)
                    return of(false);
                })
            ).subscribe(respuesta => {
                console.log("Respuesta de la API:", respuesta);
                this.cedulaValida = respuesta.valid;
                console.log("valor de cedulaValida: ", this.cedulaValida);
            });
        } catch (e) {
            console.error(e);
        }
    }

    concluirVoto(){
        this.router.navigate(['/registro']);
    }


}
