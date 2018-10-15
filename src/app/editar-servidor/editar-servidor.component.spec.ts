import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarServidorComponent } from './editar-servidor.component';

describe('EditarServidorComponent', () => {
  let component: EditarServidorComponent;
  let fixture: ComponentFixture<EditarServidorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditarServidorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarServidorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
