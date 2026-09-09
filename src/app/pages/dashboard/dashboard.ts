import { Component, AfterViewInit } from '@angular/core';

declare const Chart: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements AfterViewInit {

  ngAfterViewInit(): void {

    const ctx = document.getElementById('salesChart') as HTMLCanvasElement;

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Sales',
          data: [120, 200, 150, 300, 250, 400, 33, 232, 244, 232, 224, 555],
          backgroundColor: [
            '#4CAF50',
            '#2196F3',
            '#FFC107',
            '#FF5722',
            '#9C27B0',
            '#009688'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });


     const ctx2 = document.getElementById('salesChart2') as HTMLCanvasElement;

    new Chart(ctx2, {
      type: 'doughnut',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Sales',
          data: [120, 200, 150, 300, 250, 400, 33, 232, 244, 232, 224, 555],
          backgroundColor: [
            '#4CAF50',
            '#00579e',
            '#a77d00',
            '#a92700',
            '#7a008f',
            '#009688'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });

  }
}