import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarServidorComponent } from './agregar-servidor.component';

describe('AgregarServidorComponent', () => {
  let component: AgregarServidorComponent;
  let fixture: ComponentFixture<AgregarServidorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgregarServidorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgregarServidorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
