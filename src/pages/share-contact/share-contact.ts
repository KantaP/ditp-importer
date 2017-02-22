import { Component } from '@angular/core';
import { NavController , ModalController , ActionSheetController } from 'ionic-angular';
import { HomePage } from '../home/home';
import { ImporterService } from '../../services/importer.service';
import { GlobalService } from '../../services/global.service';
import { AdvanceSearchService } from '../../services/advance-search.service';
import { AdvanceSearchPage } from '../advance-search/advance-search'
import { AdvanceSearch } from '../../models/importer.model';
import { EmailComposer } from 'ionic-native';
import * as moment from 'moment'
/*
  Generated class for the ShareContact page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-share-contact',
  templateUrl: 'share-contact.html'
})
export class ShareContactPage {
  viewSelector : string
  importerList : any
  page: number 
  searchKey: string
  sortingData: any
  sortingSelected: any
  advanceSearch: AdvanceSearch
  _moment: any
  emails: Array<string>
  selectedIndex: Array<number>
  exportType: number
  enableExport: boolean
  groupList: any
  favgSelected: number
  constructor(
    public navCtrl: NavController ,
    private importerService : ImporterService ,
    private globalService : GlobalService ,
    private modalCtrl : ModalController , 
    private _as : AdvanceSearchService ,
    private _actionSheet: ActionSheetController
  ) {
    this.page = 1
    this.viewSelector = "importer"
    this.importerList = []
    this.searchKey = ""
    this.advanceSearch = {}
    this._moment = moment
    this.emails = []
    this.selectedIndex = []
    this.exportType = 1
    this.groupList =[]
    this.enableExport = false
    this.favgSelected = 0
  }

  ionViewWillEnter() {
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
            this.loadFavorite(this.searchKey)
          }
        )
      },200)


    }catch(err) {
      this.globalService.loaded()
    }
  }
  searchImporter(ev:any) {
    let val = ev.target.value;
    this.searchKey = val
    this.page = 1
    this.loadImporter(val , this.advanceSearch)
  }

  loadImporter(key:string="" , searchQuery: AdvanceSearch = {} , concat:boolean = false){
    this.importerService.shareContactSearch(key,searchQuery,this.page).subscribe( 
      res => {
        var resJson = res.json()
        if(concat) this.importerList = this.importerList.concat(resJson.data)
        else this.importerList = resJson.data
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
  nextPage(){
    this.searchKey = ""
    this.page++
    this.loadImporter(this.searchKey , this.advanceSearch , true)
  }

  backToHome(){
    this.navCtrl.setRoot(HomePage)
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

  selectImporter(com_id , i) {
    document.getElementById(com_id).click()
    this.toggleSelected(document.getElementById(com_id), i)
  }

  selectGroup(favg_id , i) {
    var radio = document.getElementById(favg_id)
    radio['checked'] = !radio['checked']
    this.favgSelected = parseInt(radio.getAttribute('value'))
  }

  // toggleFavgSelected(e , i) {
  //   if(e.checked) {
  //     var index = this.favgSelected.findIndex(item => item == i)
  //     if(index == -1) this.favgSelected.push(i)
  //   }else{
  //     this.favgSelected = this.favgSelected.filter(item => item !== i)
  //   }
  // }

  toggleSelected(e , i) {
    
    if(e.checked) {
      var index = this.selectedIndex.findIndex(item => item == i)
      if(index == -1) this.selectedIndex.push(i)
    }else{
      this.selectedIndex = this.selectedIndex.filter(item => item !== i)
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
  
  sortBy(ev){
    this.advanceSearch.sorting = ev.target.value
    this.loadImporter(this.searchKey , this.advanceSearch)
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
            var CSV = ""
            if(this.viewSelector == 'importer') {
              var address = []
              for(let item of this.selectedIndex) {
                var data = this.importerList[item]
                var companyname = JSON.stringify(data['com_name_en']).replace(',' , ' ')
                var busType = data['bus_type'].replace(',' , '-')
                var dataObj = {
                  com_name_en: companyname,
                  bus_type: busType,
                  com_email: data['com_email'] ,
                  com_progress_value: data['com_progress_value'],
                  com_rating: data['com_rating'],
                  com_lastvisit: data['com_lastvisit']
                }
                address.push(data['com_email'])
                selectedItems.push(dataObj)
              }
              CSV = this.ConvertToCSV(selectedItems)
              var base = btoa(encodeURIComponent(CSV).replace(/%([0-9A-F]{2})/g, function(match, p1) {
                  return String.fromCharCode(parseInt('0x' + p1));
              }))
              email = {
                to: '',
                subject: 'Export Data',
                body: '',
                attachments: 'base64:export.csv//'+base
              };
              this.sendEmail(email)
            }else if(this.viewSelector == 'favorite') {
              this.importerService.favoriteView(this.favgSelected) 
              .subscribe(
                res => {
                  var resJson = res.json()
                  // console.log(resJson , 'result')
                  var importerItems:Array<any> = resJson['data']['items']
                  var countOfItems = importerItems.length
                  // var address = []
                  if(countOfItems > 0) {
                    for(let item of importerItems) {
                      this.importerService.importerDetail(item.com_id)
                      .subscribe(
                        res => {
                          var data = res.json()['data']
                          var businessTypes = ""
                          for(let business of data['type_of_business']){
                            businessTypes += business['bus_type']+'-'
                          }
                          // console.log(businessTypes)
                          var companyname = JSON.stringify(data['company_profile']['com_name_en']).replace(',' , ' ')
                          var dataObj = {
                            com_name_en: companyname,
                            bus_type: businessTypes ,
                            com_email: data['company_profile']['com_email'] ,
                            // com_progress_value: data['com_progress_value'],
                            // com_rating: data['com_rating'],
                            // com_lastvisit: data['com_lastvisit']
                          }
                          selectedItems.push(dataObj)
                          countOfItems--
                          if(countOfItems == 0) {
                            CSV = this.ConvertToCSV2(selectedItems)
                            var base = btoa(encodeURIComponent(CSV).replace(/%([0-9A-F]{2})/g, function(match, p1) {
                                return String.fromCharCode(parseInt('0x' + p1));
                            }))
                            // console.log(CSV)
                            email = { 
                              to: '',
                              subject: 'Export Data',
                              body: '',
                              attachments: 'base64:export.csv//'+base
                            };
                            this.sendEmail(email)
                          }
                        }
                      )
                    }
                  }else{
                    this.globalService.basicAlert('Result' , `Don't have importer in this group`)
                  }
                }
              )
            } 
          }else if(this.exportType == 2){
            var addresses = []
            if(this.viewSelector == 'importer') {
              for(let item of this.selectedIndex) {
                if(this.importerList[item]['com_email']) addresses.push(this.importerList[item]['com_email'])
              }
              email = {
                to: addresses,
                subject: '',
                body: '',
                isHtml: true
              };
              this.sendEmail(email)
            }else{
              this.importerService.favoriteView(this.favgSelected) 
              .subscribe(
                res => {
                  var resJson = res.json()
                  var importerItems:Array<any> = resJson['data']['items']
                  // var countOfItems = importerItems.length
                  var addresses = []
                  for(let item of importerItems) {
                    if(item['com_email']) addresses.push(item['com_email'])
                  }
                  console.log(addresses)
                  email = {
                    to: addresses,
                    subject: '',
                    body: '',
                    isHtml: true
                  };
                  this.sendEmail(email)
                }
              )
            }
          }
        }
      }
    )
    
  }

  sendEmail(emailData) {
    this.exportType = 0
    this.enableExport = false
    EmailComposer.open(emailData)
    .then(()=>{
      // this.selectedIndex = []
      // this.favgSelected = 0
      // this.exportType = 0
      // this.enableExport = false
      this.globalService.loaded()
      this.globalService.basicAlert('Result','Email sent ')
    })
    .catch(()=>this.globalService.loaded())
  }

  loadFavorite(key:string = "") {
    this.importerService.searchFavorite(key)
    .subscribe(
      res => {
        var resJson = res.json()
        this.groupList = resJson.data
        // console.log(this.groupList)
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

  ConvertToCSV2(objArray) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
      var str = 'Company Name,Type of Business,Email\r\n';

      for (var i = 0; i < array.length; i++) {
          var line = '';
          for (var index in array[i]) {
              if (line != '') line += ','
              line += (array[i][index]) ? array[i][index] : 'n/a';
          }

          str += line + '\r\n';
      }
      return str;
  }

}
