import { Component } from '@angular/core';

@Component({
  selector: 'app-sliders',
  imports: [],
  templateUrl: './sliders.html',
  styleUrl: './sliders.scss',
})
export class Sliders {


  sliderData = [
    {
      "id": 1,
      "title": "Summer Sale",
      "description": "Get up to 50% off on all summer items.",
      "subtitle": "Limited time offer",
      "redirectionLink": "https://example.com/summer-sale",
      "image": "../../assets/images/loginBg.jpg",
      "for": "Mobile",
      "status": "Active"
    },
    {
      "id": 2,
      "title": "Winter Collection",
      "description": "Explore our new winter collection.",
      "subtitle": "Stay warm and stylish",
      "redirectionLink": "https://example.com/winter-collection",
      "image": "../../assets/images/loginBg.jpg",
      "for": "Web",
      "status": "Inactive"
    },
    {
      "id": 3,
      "title": "Winter Collection",
      "description": "Explore our new winter collection.",
      "subtitle": "Stay warm and stylish",
      "redirectionLink": "https://example.com/winter-collection",
      "image": "https://example.com/images/winter-collection.jpg",
      "for": "Web",
      "status": "Inactive"
    },
    {
      "id": 4,
      "title": "Winter Collection",
      "description": "Explore our new winter collection.",
      "subtitle": "Stay warm and stylish",
      "redirectionLink": "https://example.com/winter-collection",
      "image": "https://example.com/images/winter-collection.jpg",
      "for": "Web",
      "status": "Inactive"
    }
  ];

  constructor() {

  }

 

  editSlider(slider: any) {
    console.log('Edit slider:', slider);
    // Implement your edit logic here
  }

}
