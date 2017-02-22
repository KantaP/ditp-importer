import { Component } from '@angular/core';
import { NavController ,ViewController } from 'ionic-angular';
import { AdvanceSearchService } from '../../services/advance-search.service';
import { ImporterActions } from '../../actions/importer.actions';
import { GlobalService } from '../../services/global.service';
import { AdvanceSearch } from '../../models/importer.model';
/*
  Generated class for the AdvanceSearch page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-advance-search',
  templateUrl: 'advance-search.html'
})
export class AdvanceSearchPage {

  sourceData:any;
  office:any;
  country:any;
  businessType: any;
  company: any;
  contactPerson: any;
  sorting: any;
  autoCompleteData: any;
  companyText: string

  sourceSelected: any;
  officeSelected: any;
  countrySelected: any;
  businessTypeSelected: any;
  companySelected: any;
  contactPersonSelected: any;
  startDate:any
  endDate:any
  

  timer: any
  loadSuccess: number

  constructor(
    public navCtrl: NavController ,
    private viewCtrl: ViewController,
    private _as: AdvanceSearchService,
    private _ia: ImporterActions,
    private _global: GlobalService
  ) {
    this.sourceSelected = ""
    this.officeSelected = ""
    this.countrySelected = ""
    this.businessTypeSelected = ""
    this.companySelected = ""
    this.contactPersonSelected = ""
    this.timer = null
    this.loadSuccess = 0
    this.autoCompleteData = [] 
    this.companyText = ""
  }

  ionViewWillEnter() { 
    this._global.loading('Initailize data...')
    setTimeout(()=>this._global.getFromStorageAsync('@advance:sourceData').then(res => {this.sourceData = res;this.loadSuccess++}) , 100 )
    setTimeout(()=> this._global.getFromStorageAsync('@advance:office').then(res => {this.office = res;this.loadSuccess++}) , 400)
    setTimeout(()=> this._global.getFromStorageAsync('@advance:company').then(res => {this.company = res;this.loadSuccess++}) , 2000)
    setTimeout(()=> this._global.getFromStorageAsync('@advance:country').then(res => {this.country = res;this.loadSuccess++}) , 800)
    setTimeout(()=>this._global.getFromStorageAsync('@advance:businessType').then(res => {this.businessType = res;this.loadSuccess++}) ,1000)
    setTimeout(()=>this._global.getFromStorageAsync('@advance:contactPerson').then(res => {this.contactPerson = res;this.loadSuccess++}) ,1300)
    this.timer = setInterval(()=>{
      if(this.loadSuccess == 5) {
        this._global.loaded();
        clearInterval(this.timer)
      }  
    }, 100 )
    // this._global.loading('Loading...')
    
    // this.timer = setInterval(()=>{
    //   if(this.loadSuccess == 6) {
    //     this._global.loaded()
    //     clearInterval(this.timer)
    //   }
    // },100)
  }

  onKeyUp() {
    clearTimeout(this.timer)
    this.timer = setTimeout(()=> this.onSearch() , 1000)
  }

  onKeyDown() {
    clearTimeout(this.timer)
  }

  onSearch() {
      this.autoCompleteData = []
      if(this.companyText !== '') {
        this.autoCompleteData = this.company.filter( item => item['text'].includes(this.companyText))
      }
  }

  setCompany(company) {
    this.companySelected = company['value']
    this.companyText = company['text']
    this.autoCompleteData = []
  }

  search(){
    var searchQuery:AdvanceSearch = {
      sourcedata: this.sourceSelected,
      office: this.officeSelected,
      country: this.countrySelected,
      company: this.companySelected,
      contactperson: this.contactPersonSelected,
      day_start: this.startDate,
      day_end: this.endDate,
      sorting: '',
      businesstype: this.businessTypeSelected
    }
    // this._global.dispatch(this._ia.setAdvanceSearch(searchQuery))
    this.dismiss(searchQuery)
  }
  
  dismiss(params: any = null){
    this.viewCtrl.dismiss(params)
  }
}
