import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SqlViewerComponent } from './sql-viewer.component';

describe('SqlViewerComponent', () => {
  let component: SqlViewerComponent;
  let fixture: ComponentFixture<SqlViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SqlViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SqlViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
