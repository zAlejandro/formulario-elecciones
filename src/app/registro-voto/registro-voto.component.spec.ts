import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroVotoComponent } from './registro-voto.component';

describe('RegistroVotoComponent', () => {
  let component: RegistroVotoComponent;
  let fixture: ComponentFixture<RegistroVotoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroVotoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroVotoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
