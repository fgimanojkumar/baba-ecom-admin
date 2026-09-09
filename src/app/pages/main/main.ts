import { Component } from '@angular/core'; 
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main',
  imports: [
    RouterOutlet,
    RouterLink
  ],
  templateUrl: './main.html',
  styleUrl: './main.scss',
})
export class Main { }
