import { Component } from '@angular/core';
import { NavController , NavParams} from 'ionic-angular';
import * as moment from 'moment';
/*
  Generated class for the PreRegisterDetail page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-pre-register-detail',
  templateUrl: 'pre-register-detail.html'
})
export class PreRegisterDetailPage {

  detail: any
  _moment: any
  constructor(public navCtrl: NavController , private params: NavParams) {
    this.detail = this.params.data[0]
    this._moment = moment
  }

  ionViewDidLoad() {
    console.log(this.detail)
  }

  back(){
    this.navCtrl.pop()
  }

}
