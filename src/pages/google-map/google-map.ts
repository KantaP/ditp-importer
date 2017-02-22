import { Component , OnInit} from '@angular/core';
import { NavController , ViewController} from 'ionic-angular';
import {Geolocation} from 'ionic-native';
import { GlobalService } from '../../services/global.service';
import { ImporterActions } from '../../actions/importer.actions';
declare var google

interface LatLng {
  lat?: number;
  lng?: number
}
/*
  Generated class for the GoogleMap page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-google-map',
  templateUrl: 'google-map.html'
})
export class GoogleMapPage implements OnInit{
  map:any
  selectedLatlng : LatLng
  constructor(public navCtrl: NavController , private viewCtrl :ViewController, private globalService: GlobalService ,private importerActions: ImporterActions) {
    this.selectedLatlng = {
      lat: 0,
      lng: 0
    }
  }

  ngOnInit(){
    this.loadMap()
  }

  loadMap(){
    let options = {timeout: 10000, enableHighAccuracy: true};
     //ENABLE THE FOLLOWING:

    Geolocation.getCurrentPosition(options).then((position) => {
      let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      let mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }

      this.map = new google.maps.Map(<HTMLElement>document.getElementById("map"), mapOptions);;
      var marker = new google.maps.Marker({
        map: this.map,
        position: latLng,
        title: 'My Place',
        draggable:true,
      });

      google.maps.event.addListener(marker, 'dragend', (event)=>{
          this.selectedLatlng = {
            lat : event.latLng.lat(),
            lng : event.latLng.lng()
          }
          this.globalService.dispatch(this.importerActions.setCompanyDataWithKey('com_lattitude' , this.selectedLatlng.lat))
          this.globalService.dispatch(this.importerActions.setCompanyDataWithKey('com_longitude' , this.selectedLatlng.lng))
      });
    });
  }

  done() {
    this.viewCtrl.dismiss()
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}
