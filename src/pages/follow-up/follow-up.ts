import { Component } from '@angular/core';
import { NavController , ModalController , NavParams } from 'ionic-angular';
import { GlobalService } from '../../services/global.service';
import { ImporterService } from '../../services/importer.service';
import { AdvanceSearchService } from '../../services/advance-search.service';
import { AdvanceSearchPage } from '../advance-search/advance-search'
import { AdvanceSearch } from '../../models/importer.model';
import { FollowUpDetailPage } from '../follow-up-detail/follow-up-detail';
import { HomePage } from '../home/home'
import * as moment from 'moment'

/*
  Generated class for the FollowUp page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-follow-up',
  templateUrl: 'follow-up.html'
})
export class FollowUpPage {

  rate: Array<Object>
  dueDate: Array<Object>
  importerListData: Array<Object>
  _moment : any
  groupList: any
  advanceSearch: AdvanceSearch

  sortingData: any
  sortingSelected: any
  searchKey: string
  page:number

  constructor(
    public navCtrl: NavController,
    private globalService: GlobalService ,
    private importerService: ImporterService ,
    private modalCtrl: ModalController ,
    private _as: AdvanceSearchService ,
    private _navParams : NavParams
    ) {
      this.rate = [
        {
          star: "star" ,
          starOutline: "star-outline"
        },
        {
          star: "star" ,
          starOutline: "star-outline"
        },
        {
          star: "star" ,
          starOutline: "star-outline"
        },
        {
          star: "star" ,
          starOutline: "star-outline"
        },
        {
          star: "star" ,
          starOutline: "star-outline"
        }
      ]
      this.dueDate = [
        {
          period: 30,
          color: "#0ba701" ,
          opacity: 0.3
        },
        {
          period: 45,
          color: "yellow" ,
          opacity: 0.3
        },
        {
          period: 60,
          color: "orange" ,
          opacity: 0.3
        },
        {
          period: 75,
          color: "red" ,
          opacity: 0.3
        },
      ]
      this._moment = moment
      this.advanceSearch = {}
      this.searchKey = ""
      this.page = 1
      this.importerListData = []
    }

  ionViewWillEnter(){
    try{
      setTimeout(()=>{
        // this.gloalService.basicAlert('test' ,'test')
        this.globalService.loading('Loading...')
        this._as.getList('sorting')
        .subscribe(
          res => {
            var resJson = res.json()
            this.sortingData = resJson.data
            this.sortingSelected = this.sortingData[0].value
            this.advanceSearch.sorting = this.sortingData[0].value
            this.loadImporter(this.searchKey , this.advanceSearch)
          }
        )
      },200)


    }catch(err) {
      this.globalService.loaded()
    }
    
  }

  nextPage(){
    this.page++
    this.loadImporter(this.searchKey , this.advanceSearch , true)
  }


  loadImporter(key:string="" , searchQuery: AdvanceSearch = {} , concat:boolean = false){
    this.importerService.searchImporter(key,searchQuery,this.page).subscribe( 
      res => {
        if(res) {
          var resJson = res.json()
          if(concat) this.importerListData = this.importerListData.concat(resJson.data)
          else this.importerListData = resJson.data
        }
        
        this.globalService.loaded()
      },
      err => {
        this.globalService.loaded()
      },
      () => {
        this.globalService.loaded()
      }
    )
  }

  sortBy(ev){
    this.advanceSearch.sorting = ev.target.value
    this.loadImporter(this.searchKey , this.advanceSearch)
  }

  favorite(com_id){
    this.importerService.favoriteList()
    .subscribe(
      res => {
        var resJson = res.json()
        this.groupList = resJson.data
        let inputs = []
        this.globalService.getFromStorageAsync('@importer:'+com_id+':favorite')
        .then(data => {
          for(let group of this.groupList){
            inputs.push({
              type:'checkbox' ,
              label: group.favg_name,
              value: group.favg_id ,
              checked: data ? this.findFavorite(data , group.favg_id) : false
            })
          }
          this.globalService.checkboxAlert('Select your groups' , inputs)
          .then(res => {
            var selectedNumber: any = res
            try{
              this.importerService.importerSetFavorite(com_id , selectedNumber)
              var index = this.importerListData.findIndex(function(element){
                return element['com_id'] === com_id
              })
              var newData: Array<number>
              newData = selectedNumber
              this.globalService.setToStorage('@importer:'+com_id+':favorite' , newData)
              this.importerListData[index]['is_favorite'] = true
            }catch(err){
              console.log(err.message)
            }
          })
        })
        
      }
    )
  }

  findFavorite(com_data:Array<number> , favg_id:number) {
    for(let com of com_data) {
      if(com === favg_id) return true
    }
    return false
  }

  searchImporter(ev:any) {
    let val = ev.target.value;
    this.searchKey = val
    this.page = 1
    this.loadImporter(val , this.advanceSearch)
  }

  importerDetail(com_id){
    let modal = this.modalCtrl.create(FollowUpDetailPage , { com_id: com_id })
    modal.present()
  }

  openAdvanceSearch() {
    let modal = this.modalCtrl.create(AdvanceSearchPage)
    modal.present()
    modal.onDidDismiss((params)=>{
      if(params){
        this.advanceSearch.sourcedata = params.sourcedata
        this.advanceSearch.office = params.office
        this.advanceSearch.company = params.company
        this.advanceSearch.country = params.country
        this.advanceSearch.contactperson = params.contactperson
        this.advanceSearch.day_start = params.day_start
        this.advanceSearch.day_end = params.day_end
        this.loadImporter(this.searchKey , this.advanceSearch)
      }
    })
  }

  backToHome(){
    this.navCtrl.setRoot(HomePage)
  }

}
