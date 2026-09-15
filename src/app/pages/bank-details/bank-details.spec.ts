import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankDetailsPage } from './bank-details';

describe('BankDetailsPage', () => {
  let component: BankDetailsPage;
  let fixture: ComponentFixture<BankDetailsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BankDetailsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(BankDetailsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
