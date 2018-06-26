import { Component } from '@angular/core';
import {ModalController, NavController} from 'ionic-angular';
import {AddPlacePage} from "../add-place/add-place";
import {Place} from "../../models/place";
import {PlacesService} from "../../services/places";
import {PlacePage} from "../place/place";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  addPlacePage = AddPlacePage;
  places: Place[] = [];

  constructor(public modalCtrl: ModalController,
              private placesService: PlacesService) {

  }

  ngOnInit() {
    this.placesService.fetchPlaces() //fix чтобы получать список сразу при старте приложения, без необходимости перехода между страницами
      .then(
        (places: Place[]) => this.places = places
      );
  }

  ionViewWillEnter() {
    this.places = this.placesService.loadPlaces();
  }

  onOpenPlace(place: Place, index: number) {
    const modal = this.modalCtrl.create(PlacePage, {place: place, index: index});
    modal.present();
  }
}
