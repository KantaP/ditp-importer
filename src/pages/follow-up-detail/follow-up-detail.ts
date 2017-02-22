import { Component } from '@angular/core';
import { NavController , ViewController , NavParams} from 'ionic-angular';
import { ImporterService } from '../../services/importer.service';
import { Company } from '../../models/importer.model';
import { GlobalService } from '../../services/global.service';
import { ImporterPage } from '../importer/importer'
import { ImporterActions } from '../../actions/importer.actions';
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
  Generated class for the FollowUpDetail page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-follow-up-detail',
  templateUrl: 'follow-up-detail.html'
})
export class FollowUpDetailPage {

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
  countrys:any
  optionSelected: any
  businessType:any

  visitTitle:string
  visitNote:string
  importerHistory: any
  historyExpand: Array<boolean>

  hiddenVisit: boolean

  constructor(
    public navCtrl: NavController , 
    private viewCtrl: ViewController,
    private navParams: NavParams ,
    private _importerService: ImporterService,
    private _globalService: GlobalService ,
    private _importerActions: ImporterActions
    ) {
      this.viewSelector = "detail"
      this.expandLock = {
        company: false ,
        business: false ,
        product: false ,
        contact: false ,
        note : false ,
        rankscore: false
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
      this._moment = moment
      this.timer = null
      this.countrys = []
      this.businessType = []
      this.optionSelected = "a"
      this.visitNote = ""
      this.visitTitle = ""
      this.importerHistory = []
      this.historyExpand = []
      this.hiddenVisit = false
      this.paramComId = this.navParams.get('com_id')
      this.loadCompanyProfile()
    }

  loadCompanyProfile(){
      this._importerService.importerDetail(this.paramComId)
      .subscribe(
        res => {
          if(res !== null) {
            var resJson = res.json()
            this.importerData = resJson.data
            this._importerService.checkPermissionFollowUp(this.paramComId) 
            .then(
              res => {
                if(!res) { this.hiddenVisit = true}
              }
            )
            if(this.importerData.company_profile.com_lattitude !== 'null' &&
            this.importerData.company_profile.com_longitude !== 'null') {
              this._importerService.findLocationByLatLng(this.importerData.company_profile.com_lattitude , this.importerData.company_profile.com_longitude)
              .subscribe(
                res => {
                  if(res !== null) {
                    var locationResponse = res.json()
                    if(locationResponse.results.length > 0) this.companyLocation = locationResponse.results[0].formatted_address
                    else this.companyLocation = ""
                  }
                  
                }
              )
            }
          }
          
        }
      )

      this._importerService.importerHistory(this.paramComId) 
      .subscribe(
        res => {
          if(res !== null && res) { 
            var resJson = res.json()
            this.importerHistory = resJson.data
            this.importerHistory.map((item , index)=> {
              this.historyExpand.push(false)
            })
          }
          
        }
      )
  }

  busTypeSelected(busType:string){
    var check = false
    this.importerData.type_of_business.map((item)=>{
      if(item.bus_type === busType) check = true
    })
    return check
  }

  dismiss(){
    this.viewCtrl.dismiss()
  }

  expand(key) {
    this.expandLock[key] = !this.expandLock[key]
  }

  saveVisit(){
    this._importerService.checkPermissionFollowUp(this.paramComId) 
    .then(
      res => {
        if(res) {
          if(this.visitTitle == '' || this.visitNote == '') {
            this._globalService.basicAlert('Validation' , 'Please input title and note')
            return false
          }
          this._globalService.loading('Saving...')
          this._importerService.followUpSaveVisit(this.paramComId , this.visitTitle , this.visitNote)
          .subscribe(
            res => {
              var resJson = res.json()
              this._globalService.basicAlert('Result' , resJson.data.msgs)
              if(resJson.data['chk_status'] == 'Y') {
                this.loadCompanyProfile()
              }
              this.visitNote = ""
              this.visitTitle = ""
            },
            err => {

            },
            ()=>{
              this._globalService.loaded()
            }
          )
        }else{
          this._globalService.basicAlert('Permission' , 'Your permission is denied')
        }
    })
    
  }

  saveUpdate() {
    this._importerService.checkPermissionFollowUp(this.paramComId) 
    .then(
      res => {
        if(res) {
          this._globalService.loading('Preparing...') 
          this._importerService.followUpGetKeyForSaveUpdate(this.paramComId)
          .subscribe(
            res => {
              var resJson = res.json()
              this._globalService.dispatch(this._importerActions.setBusinessType(this.importerData.type_of_business))
              this._globalService.dispatch(this._importerActions.setProductCategories(this.importerData.product_information.products))
              this._globalService.dispatch(this._importerActions.setProductImageAll(this.importerData.product_information.images))
              this._globalService.dispatch(this._importerActions.setCompanyDataAll(this.importerData.company_profile))
              .then(()=>{
                this.navCtrl.push(ImporterPage , {com_id : this.paramComId , key_visit: resJson.data.key_visit })
              })
            },
            () => {
              this._globalService.loaded()
            }
          )
        }else{
          this._globalService.basicAlert('Permission' , 'Your permission is denied')
        }
      }
    )
    
  }

  expandHistory(index) {
    this.historyExpand[index] = !this.historyExpand[index]
  }

}
