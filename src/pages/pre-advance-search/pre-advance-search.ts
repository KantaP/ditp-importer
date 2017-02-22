import { Component } from '@angular/core';
import { NavController ,ViewController } from 'ionic-angular';
import { AdvanceSearchService } from '../../services/advance-search.service';
import { ImporterActions } from '../../actions/importer.actions';
import { GlobalService } from '../../services/global.service';
import * as moment from 'moment'
/*
  Generated class for the PreAdvanceSearch page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-pre-advance-search',
  templateUrl: 'pre-advance-search.html'
})
export class PreAdvanceSearchPage {

  type:any
  year:any
  fair:any
  country:any
  tradeCenter:any
  key:any
  startDate:any
  endDate:any

  _moment: any

  typeData: any
  yearData: any
  fairData: any
  countryData: any

  constructor(
    public navCtrl: NavController ,
    private viewCtrl: ViewController,
    private _as: AdvanceSearchService,
    private _ia: ImporterActions,
    private _global: GlobalService
  ) {
    this.type = "" 
    this.year = ""
    this.fair = ""
    this.country = ""
    this.tradeCenter = ""
    this.key = ""
    this.startDate = ""
    this.endDate = ""
    this._moment = moment
  }

  ionViewDidLoad() { 
    this._as.getListPreSearch('type')
    .subscribe(
      res => {
        var resJson = res.json()
        this.typeData = resJson['data']
      }
    )
    this._as.getListPreSearch('year')
    .subscribe(
      res => {
        var resJson = res.json()
        this.yearData = resJson['data']
      }
    )
    
    this._global.getFromStorageAsync('@advance:country').then(res => {this.countryData = res})
  }

  fetchFair(e){
    this._as.getListPreSearch('fair' , e.srcElement.value)
    .subscribe(
      res => {
        var resJson = res.json()
        this.fairData = resJson['data']
      }
    )
  }

  search(){
    var searchQuery = {
      type: this.type,
      year: this.year,
      fair: this.fair,
      country: this.country,
      tradeCenter: this.tradeCenter,
      key : this.key,
      startDate :this.startDate,
      endDate: this.endDate
    }
    // this._global.dispatch(this._ia.setAdvanceSearch(searchQuery))
    this.dismiss(searchQuery)
  }

  dismiss(params: any = null){
    this.viewCtrl.dismiss(params)
  }

}
