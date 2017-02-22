import { Component } from '@angular/core';
import { NavController , ModalController} from 'ionic-angular';
import { HomePage } from '../home/home';
import { ImporterService } from '../../services/importer.service';
import { GlobalService } from '../../services/global.service';
import { AdvanceSearchService } from '../../services/advance-search.service';
import { PreAdvanceSearchPage } from '../pre-advance-search/pre-advance-search'
import { PreRegisterDetailPage } from '../pre-register-detail/pre-register-detail';
import * as moment from 'moment'
/*
  Generated class for the PreRegister page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-pre-register',
  templateUrl: 'pre-register.html'
})
export class PreRegisterPage {

  preRegisterData: any
  sortingData:any
  sortingSelected:any
  searchKey:any
  eventData:any
  page:any
  _moment: any
  searObj : Object


  constructor(
    public navCtrl: NavController,
    private _global: GlobalService ,
    private _importer: ImporterService ,
    private _as: AdvanceSearchService ,
    private modalCtrl: ModalController
  ) {
    this.eventData = []
    this._moment = moment
    this.page = 1
    this.searObj = {}
  }

  ionViewDidLoad(){
    try{
      setTimeout(()=>{
        // this.gloalService.basicAlert('test' ,'test')
        this._global.loading('Loading...')
        this._as.getList('sorting')
        .subscribe(
          res => {
            var resJson = res.json()
            this.sortingData = resJson.data
            this.sortingSelected = this.sortingData[0].value
            //this.advanceSearch.sorting = this.sortingData[0].value
            this.loadList()
            
          }
          
        )
      },200)


    }catch(err) {
      this._global.loaded()
    }
    
  }

  searchEvent(ev:any) {
    let val = ev.target.value;
    this.searchKey = val
    this.page = 1
    this.searObj['key'] = this.searchKey
    this.loadList(this.searObj , this.page , false)
  }

  nextPage(){
    this._global.loading('loading...')
    this.page++
    this.loadList(this.searObj , this.page)
  }
  

  loadList(searchQuery:Object = {} , page: number = 1 , concat=true) {
    this._as.loadPreEvent(searchQuery , page)
    .subscribe(
      res => {
        var resJson = res.json()
        var oldData = this.eventData
        if(concat) this.eventData = oldData.concat(resJson['data'])
        else this.eventData = resJson['data']
        this._global.loaded()
      }
    )
  }

  backToHome(){
    this.navCtrl.setRoot(HomePage)
  }

  goToDetail(pre_pid) {
    this.navCtrl.push(PreRegisterDetailPage , this.eventData.filter(item => item.pre_pid == pre_pid))
  }

  openAdvanceSearch() {
    let modal = this.modalCtrl.create(PreAdvanceSearchPage)
    modal.present()
    modal.onDidDismiss((params)=>{
      if(params){
        console.log(params)
        this.searObj = params
        this._as.loadPreEvent(params)
      }
    })
  }

}
