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
                    <label for="exampleFormControlInput1" class="form-label">CEDULA</label>
                    <input  name="cedula" [(ngModel)]="cedula" (ngModelChange)="validarCedula()" type="text" class="form-control" placeholder="000-000000-0"  [ngClass]="{'is-valid': cedulaValida}">
                </div>

                <div class="col-6 d-flex gap-3" (click)="alternarBorde(1)" [ngClass]="{'border border-info border-3': voto === 1}">
                    <img  class="img-fluid" [src]="plancha1" alt="Avatar" width="500">
                </div>

                <div class="col-6 d-flex gap-3" (click)="alternarBorde(2)" [ngClass]="{'border border-info border-3': voto === 2}">
                    <img  class="img-fluid" [src]="plancha2" alt="Avatar" width="500">
                </div>

                <div class="text-center">
                    <button (click)="enviar()" class="btn btn-primary w-25 p-3" [disabled]="cedulaValida !== true"  type="submit" disabled>VOTAR</button>
                </div>
            </form>
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

    form: FormGroup = this.fb.group({
        nombre: ['', Validators.required],
        cedula: ['', [Validators.required]],
        mensaje: ['', Validators.required]
    });

    mensajeEnviado = signal(false);
    cedulaValida: boolean | false = false;

    resaltado: boolean = false;

    alternarBorde(id: number) {
        this.voto = id;
        console.log(this.voto);
    }


    async enviar(){
        if(this.voto != 0){
            this.guardarVoto(this.cedula);
        }
    }


    async verificarDuplicado(cedula: string): Promise<boolean>{
        const cedulaRef = collection(this.firestore, 'votantes');
        const q = query(cedulaRef, where('cedula', '==', cedula));
        const snapshot = await getDocs(q);

        return !snapshot.empty;
    }

    async guardarVoto(cedula: string){
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
