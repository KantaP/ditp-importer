import { Component } from '@angular/core';
import { NavController , ModalController } from 'ionic-angular';
// import { Network } from 'ionic-native';
import { HomePage } from '../home/home';
import * as moment from 'moment'
// import { ImporterDetailPage } from '../importer-detail/importer-detail'
import { ImporterService } from '../../services/importer.service'
import { GlobalService } from '../../services/global.service'
import { ImporterActions } from '../../actions/importer.actions'
import { ImporterPage } from '../importer/importer'
import { ImporterDetailPage } from '../importer-detail/importer-detail';
/*
  Generated class for the MyPortfolio page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-my-portfolio',
  templateUrl: 'my-portfolio.html'
})
export class MyPortfolioPage {

  offlineBar: boolean
  onlineBar: boolean
  rate: any;
  dueDate: any
  _moment: any
  searchKey: any
  page: any
  offlineMode: boolean
  importerListData: any
  importerListDataOffline: any
  connection: boolean

  constructor(
    public navCtrl: NavController ,
    private _importerService : ImporterService ,
    private _globalService : GlobalService ,
    private modalCtrl : ModalController ,
    private importerActions: ImporterActions
  ) {
    this.offlineBar = false
    this.onlineBar = false
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
    this.searchKey = ""
    this.page = 1
    this.offlineMode = false
    this.importerListData = []
    this.importerListDataOffline = []
    

  }

  ionViewWillEnter() {

    this._globalService.select('userState').subscribe(res => {
        this.offlineMode = res.offlineMode
    })

    setTimeout(()=>{
      this._globalService.loading('Loading...')
      this.loadImporter() 
      this.loadImporterOffLine()
      // if(!this.offlineMode) {
      //   this._globalService.loading('Loading...')
      //   this.loadImporter() 
      // }else{
      //   this._globalService.loading('Loading...')
      //   this.loadImporterOffLine()
      // }
    },200)

    /*let disconnectSubscription = Network.onDisconnect().subscribe(() => {
      console.log('network was disconnected :-(');
      console.log(Network.connection)
    });
    let connectSubscription = Network.onConnect().subscribe((res) => {
      console.log(res)
      console.log(Network.connection)*
    })*/
  }

  removeOfflineItem(keyForm: string) {
    this.importerListDataOffline = this.importerListDataOffline.filter(item => item.keyForm !== keyForm)
    this._globalService.setToStorage('@importer:offline' , this.importerListDataOffline)
  }

  syncData(keyForm: string) {
    this.importerListDataOffline.map((item)=>{
      if(item.keyForm == keyForm) {
        this._globalService.dispatch(this.importerActions.setCompanyDataAll(item.companyProfile))
        .then(()=>{
          // console.log('---- Company Profile ----')
          this._importerService.promiseInsertCompanyProfile()
          .then(
            res => {
              if(res.hasOwnProperty('com_id')){
                // console.log('com_id : ' + res['com_id'])
                
                // console.log('---- Type of Business ----')
                if(item.hasOwnProperty('typeOfBusiness') && item['typeOfBusiness'].length > 0) {
                  // console.log('set item : ' + item['typeOfBusiness'].length)
                  this._globalService.dispatch(this.importerActions.setBusinessType(item['typeOfBusiness']))
                  // console.log('Insert')
                  this._importerService.insertBusinessTypeWithComId(res['com_id'])
                }

                // console.log('---- Product Category ----')
                if(item.hasOwnProperty('selectedProduct') && item['selectedProduct'].length > 0) {
                  for(let product of item['selectedProduct']) {
                    // console.log('add :' + product.pro_name)
                    this._importerService.insertProductCategory({ pro_id: product.pro_id , pro_name: product.pro_name})
                  }
                }

                // console.log('---- Upload Product Category ----')
                if(item.hasOwnProperty('uploadProduct') && item['uploadProduct'].length > 0) {
                  for(let product of item['uploadProduct']) {
                    // console.log(product)
                    this._importerService.insertNewProductCategory(product)
                  }
                }

                // console.log('---- Contact Person ----')
                if(item.hasOwnProperty('contactPersons') && item['contactPersons'].length > 0) {
                  for(let contact of item['contactPersons']) {
                    setTimeout(()=>{
                      // console.log(contact)
                      this._globalService.dispatch(this.importerActions.setContactPersonAll(contact))
                      .then(()=>{
                        // console.log('insert')
                        this._importerService.insertContactPerson()
                      })
                    },1000)
                  }
                }

                // console.log('---- Note Need ----')
                if(item.hasOwnProperty('noteNeed')) {
                  if(item.hasOwnProperty('noteNeedImages')) {
                    // console.log('set note images: ' + item['noteNeedImages'].length)
                    this._globalService.dispatch(this.importerActions.setNoteNeedImageAll(item['noteNeedImages']))
                  }
                  // console.log('set item' )
                  this._globalService.dispatch(this.importerActions.setNoteNeedAll(item['nodeNeed']))
                  .then(()=>{
                    // console.log('insert')
                      this._importerService.insertNoteNeed() 
                  })
                }
                this.removeOfflineItem(keyForm)
                this._globalService.basicAlert('Result' , 'Sync data success')
              }
            }
          )
          .catch(
            err => this._globalService.basicAlert('Warning' , err.error)
          )
        })
      }
    })
  } 

  loadImporter(key:string="" , concat:boolean = false){
    this._importerService.searchImporter(key, {} ,this.page , true).subscribe( 
      res => {
        if(res) {
          var resJson = res.json()
          if(concat) this.importerListData = this.importerListData.concat(resJson.data)
          else this.importerListData = resJson.data
        }
        this._globalService.loaded()
      },
      err => {
        this._globalService.loaded()
      },
      () => {
        this._globalService.loaded()
      }
    )
  }

  loadImporterOffLine() {
    this._globalService.getFromStorageAsync('@importer:offline') 
    .then(
      res => {
        if(res) {
          this.importerListDataOffline = res
          this.importerListDataOffline = this.importerListDataOffline.filter(item => item.hasOwnProperty('companyProfile'))
          this._globalService.setToStorage('@importer:offline' , this.importerListDataOffline)
        }
        this._globalService.loaded()
      }
    )
  }

  importerDetail(com_id){
    this._importerService.importerDetail(com_id)
    .subscribe(
      res => {
        var resJson = res.json()
        this._globalService.dispatch(this.importerActions.setBusinessType(resJson.data.type_of_business))
        this._globalService.dispatch(this.importerActions.setProductCategories(resJson.data.product_information.products))
        this._globalService.dispatch(this.importerActions.setProductImageAll(resJson.data.product_information.images))
        this._globalService.dispatch(this.importerActions.setCompanyDataAll(resJson.data.company_profile))
        .then(()=>{
          this.navCtrl.push(ImporterPage , {com_id : com_id , key_visit: "" , force_update: true})
        })
      }
    )
  }

  importerOfflineDetail(index) {
    if(this.importerListDataOffline[index].hasOwnProperty('typeOfBusiness')) this._globalService.dispatch(this.importerActions.setBusinessType(this.importerListDataOffline[index].typeOfBusiness))
    if(this.importerListDataOffline[index].hasOwnProperty('selectedProduct'))  this._globalService.dispatch(this.importerActions.setProductCategories(this.importerListDataOffline[index].selectedProduct))
    if(this.importerListDataOffline[index].hasOwnProperty('uploadProduct'))  this._globalService.dispatch(this.importerActions.setProductImageAll(this.importerListDataOffline[index].uploadProduct))
    this._globalService.dispatch(this.importerActions.setCompanyDataAll(this.importerListDataOffline[index].companyProfile))
    .then(()=>{
      this.navCtrl.push(ImporterPage , {index_id : index , key_visit: "" , offlineMode: true , keyForm: this.importerListDataOffline[index].keyForm})
    })
  }

  searchImporter(ev:any) {
    let val = ev.target.value;
    this.searchKey = val
    this.page = 1
    this.loadImporter(val)
  }

  nextPage(){
    this.page++
    this.loadImporter(this.searchKey , true)
  }

  backToHome(){
    this.navCtrl.setRoot(HomePage)
  }

  showOffline(){
    this.offlineBar = !this.offlineBar
  }

  showOnline() {
    this.onlineBar = !this.onlineBar
  }

  deleteImporter(com_id) {
    this._globalService.confirmAlert("Warning", "Are you confirm to delete this importer ?")
    .then(
      res => {
        if(res) {
          this._importerService.deleteImporter(com_id)
          .subscribe(
            res => {
              this.loadImporter()
            }
          )
        }
      }
    )
  }

  openImporterDetail(com_id){
    let modal = this.modalCtrl.create(ImporterDetailPage , { com_id: com_id })
    modal.present()
  }

}
