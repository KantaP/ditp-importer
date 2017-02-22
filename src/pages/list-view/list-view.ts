import { Component } from '@angular/core';
import { NavController , ModalController , NavParams  , ActionSheetController} from 'ionic-angular';
import { EmailComposer } from 'ionic-native';
import { GlobalService } from '../../services/global.service';
import { ImporterService } from '../../services/importer.service';
import { AdvanceSearchService } from '../../services/advance-search.service';
import { AdvanceSearchPage } from '../advance-search/advance-search'
import { AdvanceSearch } from '../../models/importer.model';
import { ImporterDetailPage } from '../importer-detail/importer-detail';
import { HomePage } from '../home/home';
import * as moment from 'moment'
/*
  Generated class for the ListView page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-list-view',
  templateUrl: 'list-view.html'
})
export class ListViewPage {

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
  enableExport : boolean
  exportType: number
  selectSendItems: Array<number>

  constructor(
    public navCtrl: NavController,
    private globalService: GlobalService ,
    private importerService: ImporterService ,
    private modalCtrl: ModalController ,
    private _as: AdvanceSearchService ,
    private _navParams : NavParams ,
    private _actionSheet: ActionSheetController
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
      this.enableExport = false
      this.exportType = 0
      this.selectSendItems = []
    }

  selectSend(e) {
    if(e.target.checked) {
      this.selectSendItems.push(e.target.value)
    }else{
      this.selectSendItems = this.selectSendItems.filter(item => item != e.target.value)
    }
  }

  send() {
    this.globalService.getFromStorageAsync('@user:data')
    .then(
      res => {
        if(res) {
          // this.globalService.loading('Sending...')
          let email = {}
          if(this.exportType == 1) {
            var selectedItems = []
            for(let item of this.selectSendItems) {
              var data = this.importerListData.filter(items => items['com_id'] == item)
              var companyname = JSON.stringify(data[0]['com_name_en']).replace(',' , ' ')
              var busType = data[0]['bus_type'].replace(',' , '-')
              var dataObj = {
                com_name_en: companyname,
                bus_type: busType,
                com_email: data[0]['com_email'] ,
                com_progress_value: data[0]['com_progress_value'],
                com_rating: data[0]['com_rating'],
                com_lastvisit: data[0]['com_lastvisit']
              }
              selectedItems.push(dataObj)
            }
            var CSV = this.ConvertToCSV(selectedItems)
            console.log(CSV)
            var base = btoa(encodeURIComponent(CSV).replace(/%([0-9A-F]{2})/g, function(match, p1) {
                return String.fromCharCode(parseInt('0x' + p1));
            }))
            email = {
              to: '',
              subject: 'Export Data',
              body: '',
              attachments: 'base64:export.csv//'+base
            };
          }else if(this.exportType == 2){
            var addresses = []
            for(let item of this.selectSendItems) {
              var data = this.importerListData.filter(items => items['com_id'] == item)
              addresses.push(data[0]['com_email'])
            }
            email = {
              to: addresses,
              subject: '',
              body: '',
              isHtml: true
            };
          }
          EmailComposer.open(email)
          .then(()=>{
            this.selectSendItems = []
            this.exportType = 0
            this.enableExport = false
            this.globalService.loaded()
            this.globalService.basicAlert('Result','Email sent ')
          })
          // .catch(()=>this.globalService.loaded())
        }
      }
    )
    
  }

  ConvertToCSV (objArray) {
      var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
      var str = 'Company Name,Type of Business,Email,Progress of Data,Rating,Last Visit\r\n';

      for (var i = 0; i < array.length; i++) {
          var line = '';
          for (var index in array[i]) {
              if (line != '') line += ','

              line += array[i][index];
          }

          str += line + '\r\n';
      }
      return str;
  };

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

  export() {
    this.enableExport = true
    this.exportActions()
  }

  exportActions() {
    let actionSheet = this._actionSheet.create({
      title: 'Select your export type',
      buttons: [
        {
          text: 'Export Data',
          handler: () => {
            this.exportType = 1
          }
        },{
          text: 'Send Data',
          handler: () => {
            this.exportType = 2
          }
        },{
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            this.enableExport = false
            this.exportType = 0
          }
        }
      ]
    });
    actionSheet.present();
  }

  nextPage(){
    this.searchKey = ""
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
              if(selectedNumber.length == 0) this.importerListData[index]['is_favorite'] =  false
              else this.importerListData[index]['is_favorite'] =  true
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
    let modal = this.modalCtrl.create(ImporterDetailPage , { com_id: com_id })
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
