import { Component } from '@angular/core';
import { Calendar } from '../../shared/lib/calendar/calendar';

@Component({
  selector: 'app-contact',
  imports: [Calendar],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {}
