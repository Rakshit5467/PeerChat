import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeerchatComponent } from './peerchat.component';

describe('PeerchatComponent', () => {
  let component: PeerchatComponent;
  let fixture: ComponentFixture<PeerchatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeerchatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PeerchatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
