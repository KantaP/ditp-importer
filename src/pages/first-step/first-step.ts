import { Component  , NgZone , OnDestroy } from '@angular/core';
import { NavController , Tabs , ModalController , NavParams } from 'ionic-angular';
import { Http } from '@angular/http'
// import * as moment from 'moment';

import { Country } from '../../models/importer.model';
import { ImporterActions } from '../../actions/importer.actions';
import { ImporterService } from '../../services/importer.service';
import { GlobalService } from '../../services/global.service';
import { ImporterState } from '../../reducers/importer.reducer';
import { Company } from '../../models/importer.model';
import { Subscription } from 'rxjs/Subscription';
// import { SecondStepPage } from '../second-step/second-step';
import { GoogleMapPage } from '../google-map/google-map'

declare var google

/*  
  Generated class for the FirstStep page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-first-step',
  templateUrl: 'first-step.html'
})
export class FirstStepPage implements  OnDestroy{

  countrys?: Array<Country>
  importerState?: ImporterState
  com_image: string = ''
  com_subImage1: string = ''
  com_subImage2: string = ''
  com_subImage3: string = ''
  subScription: Subscription
  locationName: string ;

  currentImage: ''
  companyProfile: Company
  keyForm: string
  latlng: string

  updateMode: boolean
  offlineMode: boolean

  constructor(
    public navCtrl: NavController , 
    private importerActions: ImporterActions ,
    private globalService: GlobalService,
    private importerService: ImporterService,
    private _ngzone: NgZone,
    private tab:Tabs,
    private modal:ModalController,
    private _http: Http ,
    private _navParams: NavParams
  ) {
    
    this.companyProfile = {
      com_logo: '' ,
      com_name_en: '',
      com_address_en: '',
      com_fax: '',
      com_email: '' ,
      com_city_en: '',
      com_website: '',
      com_state_en: '',
      com_lattitude: '',
      com_longitude: '',
      cou_code: 0 ,
      com_street_en: '',
      com_telephone: '',
      com_zipcode_en: '',
      com_factory_pic1: '',
      com_factory_pic2: '',
      com_factory_pic3: '',
      com_sub_state_en: ''
    }
  } 

  ionViewDidLoad() {
    
    // this.globalService.loading('Please wait...')
    this.globalService.select('importerState').subscribe(res => {
        this.importerState = res
        this.companyProfile = Object.assign({} , this.companyProfile , this.importerState.importerData.CompanyProfile)
        this.latlng = (this.companyProfile.com_lattitude && this.companyProfile.com_longitude) ? this.companyProfile.com_lattitude + ' , ' + this.companyProfile.com_longitude : '' 
        if(this.latlng) {
          this._http.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${this.latlng}&key=AIzaSyCFp_PA08fXXBwFD0SPRaQIUotIL8XLcW8`)
          .subscribe(res => {
            var resJson = res.json()
            this.locationName = resJson.results[0].formatted_address
          })
        }
    })

    this.globalService.getFromStorage('@country:list').subscribe(res => {
        if(res) {
          this.countrys = res
        }
    })
    // console.log(this._navParams.data)
    if(typeof this._navParams.data !== 'undefined') {
      if(!this._navParams.data['offlineMode'] && (this._navParams.data['key_visit'] || this._navParams.data['force_update']))  this.updateMode = true
      else if(this._navParams.data['offlineMode']) {
        this.offlineMode = true
        this.keyForm = this._navParams.data['keyForm']
      }
    }else{
      this.updateMode = false
      this.offlineMode = false
    }
    
    // this._ngzone.runOutsideAngular(()=>{
        // this.globalService.loaded()
        // var locationInput = (<HTMLElement>document.getElementById("location"))
        // var autoComplete = new google.maps.places.Autocomplete(locationInput)
        // this._ngzone.run(()=>{
        //   google.maps.event.addListener(autoComplete, 'place_changed', ()=> {
        //     let place = autoComplete.getPlace();
        //     let geometry = place.geometry;
        //     if ((geometry) !== undefined) {
        //       this._ngzone.run(()=>{
        //         this.globalService.dispatch(this.importerActions.setCompanyDataWithKey('com_lattitude' , geometry.location.lat()))
        //         this.globalService.dispatch(this.importerActions.setCompanyDataWithKey('com_longitude' , geometry.location.lng()))
        //       })
        //   }})
          
        // })  
    // })
  }

  // handleInputChange(e) {
  //     var file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];

  //     var pattern = /image-*/;
  //     var reader = new FileReader();

  //     if (!file.type.match(pattern)) {
  //         alert('invalid format');
  //         return;
  //     }

  //     reader.onload = this._handleReaderLoaded.bind(this);
  //     reader.readAsDataURL(file);
  // }

  // _handleReaderLoaded(e) {
  //   var reader = e.target;
  //   this.globalService.dispatch(this.importerActions.setCompanyDataWithKey('com_logo' , reader.result))
  // }

  selectLogoImage() {
    this.globalService.imageActionSheet('com_logo') 
  }


  selectFac1Image() {
    this.globalService.imageActionSheet('com_factory_pic1')
  }

  selectFac2Image() {
    this.globalService.imageActionSheet('com_factory_pic2')
  }

  selectFac3Image() {
    this.globalService.imageActionSheet('com_factory_pic3')
  }

  gotoSecondStep() {
    if(this.updateMode) {
      if(
        (!this.companyProfile.hasOwnProperty('com_logo') || this.companyProfile.com_logo == '') ||
        (!this.companyProfile.hasOwnProperty('com_name_en') || this.companyProfile.com_name_en == '') ||
        (!this.companyProfile.hasOwnProperty('com_address_en') || this.companyProfile.com_address_en == '') ||
        (!this.companyProfile.hasOwnProperty('cou_code') || this.companyProfile.cou_code == 0)
        ) 
       {
        this.globalService.basicAlert('Warning' , 'Please input logo , country , company name , company address')
      }else{  
        this.globalService.dispatch(this.importerActions.setCompanyDataAll(this.companyProfile))
        .then(()=>{
          this.importerService.updateImporter(this._navParams.data.com_id  , this._navParams.data.key_visit  ,this.companyProfile )
          //this.globalService.dispatch(this.importerActions.addCompanySuccess());
        })
        this.globalService.setCurrentRoute('secondStep')
        this.tab.select(1)
      }
      
    }else if(this.offlineMode) {
      if(
        (!this.companyProfile.hasOwnProperty('com_logo') || this.companyProfile.com_logo == '') ||
        (!this.companyProfile.hasOwnProperty('com_name_en') || this.companyProfile.com_name_en == '') ||
        (!this.companyProfile.hasOwnProperty('com_address_en') || this.companyProfile.com_address_en == '') ||
        (!this.companyProfile.hasOwnProperty('cou_code') || this.companyProfile.cou_code == 0)
        )
       {
        this.globalService.basicAlert('Warning' , 'Please input logo , country , company name , company address')
      }else{
        this.globalService.getFromStorageAsync('@importer:offline')
        .then(
          (res:Array<any>) => {
            let newData = {
              keyForm: this.keyForm ,
              companyProfile: this.companyProfile
            }
            let index = res.findIndex(item => item.keyForm == this.keyForm) 
            let newRes = res[index]
            newRes = Object.assign({} , newRes , newData)
            res[index] = newRes
            this.globalService.setToStorage('@importer:offline' , res)
            this.globalService.setCurrentRoute('secondStep')
            this.tab.select(1)
          }
        )
      }
    }
    else{
      if(
        (!this.companyProfile.hasOwnProperty('com_logo') || this.companyProfile.com_logo == '') ||
        (!this.companyProfile.hasOwnProperty('com_name_en') || this.companyProfile.com_name_en == '') ||
        (!this.companyProfile.hasOwnProperty('com_address_en') || this.companyProfile.com_address_en == '') ||
        (!this.companyProfile.hasOwnProperty('cou_code') || this.companyProfile.cou_code == 0)
        ) 
       {
        this.globalService.basicAlert('Warning' , 'Please input logo , country , company name , company address')
      }else{
        this.globalService.dispatch(this.importerActions.setCompanyDataAll(this.companyProfile))
        .then(()=>{
          this.importerService.insertCompanyProfile();
          //this.globalService.dispatch(this.importerActions.addCompanySuccess());
        })
        this.globalService.setCurrentRoute('secondStep')
        this.tab.select(1)
      }
    }
  }

  openMap(){
    let modal = this.modal.create(GoogleMapPage);
    modal.present()
  }
  
  ngOnDestroy(){
    this.companyProfile = {
      com_logo: '' ,
      com_name_en: '',
      com_address_en: '',
      com_fax: '',
      com_email: '' ,
      com_city_en: '',
      com_website: '',
      com_state_en: '',
      com_lattitude: '',
      com_longitude: '',
      cou_code: 0 ,
      com_street_en: '',
      com_telephone: '',
      com_zipcode_en: '',
      com_factory_pic1: '',
      com_factory_pic2: '',
      com_factory_pic3: '',
      com_sub_state_en: ''
    }
  }
}
