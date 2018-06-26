import { Component } from '@angular/core';
import {IonicPage, LoadingController, ModalController, NavController, NavParams, ToastController} from 'ionic-angular';
import {NgForm} from "@angular/forms";
import {SetLocationPage} from "../set-location/set-location";
import {Location} from "../../models/location";
import {Geolocation} from "@ionic-native/geolocation";
import {Camera} from "@ionic-native/camera";
import {Entry, File, FileError} from "@ionic-native/file";
import {PlacesService} from "../../services/places";

declare var cordova: any;

@IonicPage()
@Component({
  selector: 'page-add-place',
  templateUrl: 'add-place.html',
})
export class AddPlacePage {
  location: Location = {
    lat: 40.7624324,
    lng: -73.975982
  };
  locationIsSet = false;
  imageUrl = '';

  constructor (private modalCtrl: ModalController,
               private loadingCtrl: LoadingController,
               private toastCtrl: ToastController,
               private placesService: PlacesService,
               private camera: Camera,
               private geolocation: Geolocation,
               private file: File) {}

  onSubmit(form: NgForm) {
    this.placesService.addPlace(form.value.title, form.value.description, this.location, this.imageUrl);
    form.reset();
    this.location = {
      lat: 40.7624324,
      lng: -73.9759827
    };
    this.imageUrl = '';
    this.locationIsSet = false;
  }

  onOpenMap() {
    const modal = this.modalCtrl.create(SetLocationPage, {location: this.location, isSet: this.locationIsSet});
    modal.present();
    modal.onDidDismiss(
      data => {
        if (data) {
          this.location = data.location;
          this.locationIsSet = true;
        }
      }
    )
  }

  onLocate() {
    const loader = this.loadingCtrl.create({
      content: 'Getting your location...'
    });
    loader.present();
    this.geolocation.getCurrentPosition()
      .then(
        location => {
          loader.dismiss();
          this.location.lat = location.coords.latitude;
          this.location.lng = location.coords.longitude;
          this.locationIsSet = true;
        }
      )
      .catch(
        error => {
          loader.dismiss();
          const toast = this.toastCtrl.create({
            message: 'Could not get location, please pick it manually!',
            duration: 2500
          });
          console.log(error);
        }
      );
  }

  onTakePhoto() {
    this.camera.getPicture({
      encodingType: this.camera.EncodingType.JPEG,
      correctOrientation: true,
    })
      .then(
        imageData => {
          const currentName = imageData.replace(/^.*[\\\/]/, ''); //убираем через регулярку всё, чтобы получить имя файла
          const path = imageData.replace(/[^\/]*$/, ''); //получаем путь без имени файла
          const newFileName = new Date().getUTCMilliseconds() + '.jpg';
          this.file.moveFile(path, currentName, cordova.file.dataDirectory, newFileName) //cordova.file.dataDirectory даёт путь к каталогу приложения
            .then(
              (data: Entry) => {
                this.imageUrl = data.nativeURL;
                this.camera.cleanup();
              }
            )
            .catch(
              (err: FileError) => {
                this.imageUrl = imageData;
                const toast = this.toastCtrl.create({
                  message: 'Could not save image. Please try again',
                  duration: 2500
                });
                toast.present();
                this.camera.cleanup();
              }
            )
          this.imageUrl = imageData;
        }
      )
      .catch(
        err => {
          const toast = this.toastCtrl.create({
            message: 'Could not save image. Please try again',
            duration: 2500
          });
          toast.present();
        }
      );
  }
}
