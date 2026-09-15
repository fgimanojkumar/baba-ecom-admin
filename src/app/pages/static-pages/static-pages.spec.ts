import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaticPages } from './static-pages';

describe('StaticPages', () => {
  let component: StaticPages;
  let fixture: ComponentFixture<StaticPages>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaticPages],
    }).compileComponents();

    fixture = TestBed.createComponent(StaticPages);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
