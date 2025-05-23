import { Component, inject, signal, OnInit} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms'
import { Firestore, collection, addDoc, query, where, collectionData, getDocs} from '@angular/fire/firestore';
import { CedulaService } from './servicios/cedula.service';
import { catchError, debounce, debounceTime, distinctUntilChanged, find, map, of, switchMap } from 'rxjs';
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
    <div class="container d-flex justify-content-center align-items-center min-vh-100" style="background-image: url('assets/fondo.jpg'); background-size: cover; background-position: center;">
        <div class="card p-4 shadow-lg" style="max-width: 80%; width: 80%; background-color: rgba(255, 255, 255, 0.9);">
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
                                placeholder="INGRESE SU CEDULA"  
                                [ngClass]="{
                                'is-valid': cedulaValida,
                                'is-invalid': cedula && !cedulaValida
                                }"
                                (ngModelChange)="votoRealizado()"
                                >

                            <div *ngIf="cedulaRegistrada==false" class="valid-feedback">
                                Cédula válida.
                            </div>
                            <div class="invalid-feedback">
                                Cedula invalida.
                            </div>
                            <p class="text-center text-warning small mt-3" *ngIf="cedulaRegistrada">
                                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                                LA CEDULA INDICADA YA HA REGISTRADO UN VOTO
                            </p>
                        </div>

                        <p class="text-center text-muted small mt-3">
                            A continuación selecciona un candidato
                        </p>

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
                            <button (click)="enviar()" class="btn btn-primary w-25 p-3" [disabled]="!cedulaValida" type="submit" *ngIf="votacionActiva" disabled>VOTAR</button>
                            
                            <p class=" text-warning small mt-3" *ngIf="votacionActiva==false">
                                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                                LAS VOTACIONES YA HAN CONCLUIDO. GRACIAS POR SU PARTICIMACION
                            </p>
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
                            <p class=" text-warning small mt-3" *ngIf="cedulaRegistrada">
                                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                                LA CEDULA INDICADA YA HA REGISTRADO UN VOTO
                            </p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">NO</button>
                            <button id="confirmButton" (click)="confirmarVoto()"  type="button" class="btn btn-primary" [disabled]="cedulaRegistrada">SI</button>
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
        </div>
    </div>
    
    
  `
})

export class HomeComponent {
    private fb = inject(FormBuilder);
    private firestore = inject(Firestore);
    private api = inject(CedulaService);
    private router = inject(Router);

    plancha1 = './assets/plantillaVotacionPlancha1.png'
    plancha2 = './assets/plantillaVotacionPlancha2.png';

    cedula = "";
    voto = 0;

    botonActivo = false;
    votacionActiva = false;
    modalRef: any;

    permitirExcepcion = false;

    datos: any[] = [];
    excepciones: any[] = [];

    getDatos(){
        const coleccion = collection(this.firestore, 'sistema');
        return collectionData(coleccion, { idField: 'id'});
    }

    getExcepciones(){
        const coleccion = collection(this.firestore, 'excepciones');
        return collectionData(coleccion, { idField: 'id'});
    }
    async verificarExcepcion(cedula: string){
        const cedulaRef = collection(this.firestore, 'excepciones');
        const q = query(cedulaRef, where('cedula', '==', this.cedula));
        const snapshot = await getDocs(q);
        console.log("excepcion: ",snapshot.docs);

        return !snapshot.empty;
    }
    
    async excepcionesAgregadas(){
        const existe = await this.verificarExcepcion(this.cedula);

        if(existe){
            console.log("tenemos una excepcion");
        }else{
            console.log("no hay ecepciones")
        }
    }


    ngOnInit(): void{
        this.verificarHora();
        this.getDatos().subscribe((res) =>{
            this.datos = res;
            console.log(this.datos[1].activo);
            this.votacionActiva = this.datos[1].activo
        })
    }
    // Verifica la hora en la Republica Dominicana
    verificarHora(){
        const fechaRD = new Date().toLocaleString('en-US', {
            timeZone: 'America/Santo_Domingo',
        });
        const horaRD = new Date(fechaRD).getHours();
        console.log(horaRD)

        if(horaRD >= 15){
            this.votacionActiva = false;
        }else{
            this.votacionActiva = true;
        }
    }


    // Abre el modal de confirmacion
    abrirModal() {
        const el = document.getElementById('exampleModal');
        console.log(el);
        this.modalRef = new bootstrap.Modal(el);
        this.modalRef.show();
    }
    // Cierra el modal activo
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
    cedulaRegistrada: boolean = false;

    // Borde de seleccion para indicar la opcion seleccionada
    alternarBorde(id: number) {
        this.voto = id;
        console.log(this.voto);
    }

    // Abre el Modal de alerta
    async enviar(){
        if(this.voto != 0){
            this.abrirModal();
        }else{
            const el = document.getElementById('alertModal');
            this.modalRef = new bootstrap.Modal(el);
            this.modalRef.show();
        }
    }

    // Verifica si la cedula digitada ya se encuentra en la Base de Datos
    async verificarDuplicado(cedula: string): Promise<boolean>{
        const cedulaRef = collection(this.firestore, 'votantes');
        const q = query(cedulaRef, where('cedula', '==', cedula));
        const snapshot = await getDocs(q);

        return !snapshot.empty;
    }
    // Guarda el voto (para el boton de confirmacion)
    confirmarVoto(){
        this.guardarVoto(this.cedula);
    }
    // Verificacion para WARNING de cedula ya utilizada
    async votoRealizado(){
        const existe = await this.verificarDuplicado(this.cedula);

        if(existe){
            this.cedulaRegistrada = true;
        }else{
            this.cedulaRegistrada = false
        }
    }
    // Guarda el voto en la Base de Datos
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
            if(this.votacionActiva){
                await addDoc(ref,datos);
                this.concluirVoto();
                this.cerrarModal();
                this.confirmarBoton = false;
            }
        }
    }

    // Valida la cedula con la API de la junta
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
                this.getExcepciones().subscribe((res) =>{
                this.excepciones = res;
                this.excepciones.forEach((excepcion, index) => {
                    console.log("excepcion: ", excepcion.cedula)
                    if(this.cedula == String(excepcion.cedula)){
                        console.warn(excepcion.cedula);
                        this.cedulaValida = true;
                        return;
                    }else{

                    }
                })
            })
            });
        } catch (e) {
            console.error(e);
        }
    }

    concluirVoto(){
        this.router.navigate(['/registro']); // Te lleva a la vista de confirmacion para conocimiento del usuario
    }
}
