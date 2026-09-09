import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Loader } from './shared/lib/loader/loader';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive,Loader],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
   isLoaderLoading = false;
  protected readonly title = signal('ecom-admin');
}
