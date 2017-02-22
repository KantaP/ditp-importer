import { Component } from '@angular/core';
import { NavController , ViewController , NavParams} from 'ionic-angular';
import { ImporterService } from '../../services/importer.service';
import { GlobalService } from '../../services/global.service';
import { Company } from '../../models/importer.model';
import * as moment from 'moment'

interface ImporterData {
  company_profile: Company
  product_information: {
    images: Array<any>,
    products: Array<any>
  }
  type_of_business: Array<any>
  contact_person: Array<any>
  note_need: Array<any>
  
}
/*
  Generated class for the ImporterDetail page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-importer-detail',
  templateUrl: 'importer-detail.html'
})
export class ImporterDetailPage {

  viewSelector:string
  expandLock: Object
  paramComId: number
  importerData: ImporterData
  companyLocation: string
  rates: Array<boolean>
  rateCount: number
  rankScore: Object
  _moment: any
  timer: any
  importerHistory: any
  historyExpand: Array<boolean>

  constructor(
    public navCtrl: NavController , 
    private viewCtrl: ViewController,
    private navParams: NavParams ,
    private _importerService: ImporterService ,
    private _globalService: GlobalService
    ) {
      this.viewSelector = "detail"
      this.expandLock = {
        company: false ,
        business: false ,
        product: false ,
        contact: false ,
        note : false ,
        rankscore: true
      }
      this.importerData = {
        company_profile: {},
        product_information: {
          images: [],
          products: []
        },
        type_of_business: [],
        contact_person: [],
        note_need: []
      }
      this.companyLocation = ""
      this.rates = [false , false , false , false ,false ]
      this.rateCount = 0
      this.rankScore = {}
      this._moment = moment
      this.timer = null
      this.importerHistory = []
      this.historyExpand = []
    }

  ionViewWillEnter(){
    this.paramComId = this.navParams.get('com_id')
    setTimeout(()=>{
      this._importerService.importerDetail(this.paramComId)
      .subscribe(
        res => {
          if(res !== null) {
            var resJson = res.json()
            this.importerData = resJson['data'] || []
            if((typeof this.importerData.company_profile.com_lattitude !== 'undefined' && this.importerData.company_profile.com_lattitude !== '' && this.importerData.company_profile.com_lattitude !== null) &&
              (this.importerData.company_profile.com_longitude !== 'undefined' && this.importerData.company_profile.com_longitude !== '' && this.importerData.company_profile.com_longitude !== null)) {
                this._importerService.findLocationByLatLng(this.importerData.company_profile.com_lattitude , this.importerData.company_profile.com_longitude)
                .subscribe(
                  res => {
                  
                    var locationResponse = res.json()
                    if(locationResponse.results.length > 0) this.companyLocation = locationResponse.results[0].formatted_address
                    else this.companyLocation = ""
                  }
                )
              }
          } 
          
        }
      )
      
      this._importerService.importerRankScore(this.paramComId) 
      .subscribe(
        res => {
          if(res !== null) {
            var resJson = res.json()
            this.rankScore = resJson['data'] || []
          }
          
        }
      )

      this._importerService.importerHistory(this.paramComId) 
      .subscribe(
        res => {
          
          if(res !== null && res) { 
            var resJson = res.json()
            if(resJson !== null) {
              this.importerHistory = resJson['data'] || []
              this.importerHistory.map((item , index)=> {
                this.historyExpand.push(false)
              })
            }
            
          }
          
        }
      )
    },500)
  }

  dismiss(){
    this.viewCtrl.dismiss()
  }

  expand(key) {
    this.expandLock[key] = !this.expandLock[key]
  }

  toggleStar(index){
    for(let i = 0 ; i <= index ; i++){
      this.rates[i] = true
    }
    for(let i = 4 ; i > index ; i--){
      this.rates[i] = false
    }
    this.rateCount = index + 1
    clearTimeout(this.timer)
    this.timer = setTimeout(()=>{
      this._importerService.importerAddRankScore(this.paramComId,this.rateCount)
      .subscribe(
        res => {
          var resJson = res.json()
          var msg = ""
          if(!resJson.data[0]['msg']) {
            if(resJson.data['is_rank'] && resJson.data['items'].length > 0) {
              msg = "Updated Rankscore"
            }else{
              msg = resJson.data[0]['msg']
            }
          }
          this._globalService.basicAlert('Result' , msg)
          this.rankScore = resJson.data
          this.rates = [false , false ,false ,false ,false]
          this.rateCount = 0
        }
      )
    }, 1000)
  }

  expandHistory(index) {
    this.historyExpand[index] = !this.historyExpand[index]
  }
}
