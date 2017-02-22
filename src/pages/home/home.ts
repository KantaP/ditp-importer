import { Component , OnInit , OnDestroy , NgZone} from '@angular/core';
import { NavController , ActionSheetController} from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { UserActions } from '../../actions/user.actions';
import { AuthenticatePage } from '../authenticate/authenticate';
import { ImporterPage } from '../importer/importer';
import { ImporterListPage } from '../importer-list/importer-list';
import { User } from '../../models/user.model';
import { GlobalService } from '../../services/global.service';
import { ImporterActions } from '../../actions/importer.actions'; 
import { Subscription } from 'rxjs/Subscription';
import { SyncService } from '../../services/sync.service';
import { FollowUpPage } from '../follow-up/follow-up';
import { MyPortfolioPage } from '../my-portfolio/my-portfolio';
import { PreRegisterPage } from '../pre-register/pre-register';
import { ShareContactPage } from '../share-contact/share-contact';
import { ImporterService } from '../../services/importer.service';
import { ProfilePage } from '../profile/profile'
/*
  Generated class for the Home page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit , OnDestroy{

  userData: User
  subScription: Subscription
  keys: any
  offlineMode: boolean
  lang: string
  langName: string

  constructor(
    public navCtrl: NavController ,
    private userAction: UserActions,
    private globalService: GlobalService,
    private storage: Storage,
    private importerAction: ImporterActions,
    private _ngzone: NgZone,
    private syncService: SyncService ,
    private _action: ActionSheetController,
    private _importer: ImporterService
  ) {

  }

  ngOnInit() {

    this._ngzone.runOutsideAngular(()=>{
      this.globalService.getFromStorage('@sync:done').subscribe( res =>{
        this._ngzone.run(()=>{
          if(!res) {
            this.globalService.loading('Sync data...')
            this.syncService.syncAllDataFromWebservice()
            // setTimeout(()=>this.globalService.loaded() , 5000)
          }
        })
      })
    })

    this.globalService.select('userState').subscribe(res => {
      this._ngzone.run(()=> {
        this.userData = res.data
        this.offlineMode = res.offlineMode
        if(this.offlineMode) {
          // console.log('offline mode')
          this.globalService.getFromStorageAsync('@importer:offline')
          .then(
            res => {
              if(!res) {
                // console.log('create importer offline')
                this.globalService.setToStorage('@importer:offline' , []) 
              }
              // this.globalService.setToStorage('@importer:offline' , []) 
            }
          )
        }
      })
    })

    this._importer.langauageCurrent()
    .subscribe(
      res => {
        var resJson = res.json()
        this.lang = resJson['data']['lan_flag']
        this.langName = resJson['data']['lan_name']
      }
    )
    this.keys = this.globalService.keysInStorage()
  }

  gotoProfile(){
    this.navCtrl.setRoot(ProfilePage)
  }

  gotoImporter() {
    // this.navCtrl.push(ImporterPage);
    this.globalService.dispatch(this.importerAction.clearAllData())
    this.navCtrl.setRoot(ImporterPage , { offlineMode: this.offlineMode});
  }

  gotoImporterList() {
    this.navCtrl.setRoot(ImporterListPage);
  }

  gotoFollowUp(){
    this.navCtrl.setRoot(FollowUpPage)
  }

  gotoMyPort(){
    this.navCtrl.setRoot(MyPortfolioPage)
  }

  gotoPreRegister() {
    this.navCtrl.setRoot(PreRegisterPage)
    //this.navCtrl.setRoot(ImporterListPage , { title: 'PRE-REGISTER'})
  } 

  gotoShareContact() {
    this.navCtrl.setRoot(ShareContactPage)
  }

  logout(){
    // 
    let actionSheet = this._action.create({
      title: 'Setting',
      buttons: [
        {
          text: 'CHANGE LANGAUAGE' ,
          handler: ()=>{
            this._importer.langauageList()
            .subscribe(
              res => {
                var resJson = res.json()
                var radioInput = []
                /*{
                  type: 'radio',
                  label: 'Blue',
                  value: 'blue',
                  checked: true
                } */
                for(let item of resJson['data']){
                  radioInput.push({
                    type:'radio' ,
                    label: item['lan_name'],
                    value: item['lan_id'],
                    checked: (item['lan_name'] == this.langName) ? true : false
                  })
                }
                this.globalService.radioAlert('Select Langauage',radioInput)
                .then(res => {
                  var lan_id = res
                  this._importer.langauageSet(lan_id)
                  .subscribe(
                    res => {
                      this._importer.langauageCurrent()
                      .subscribe(
                        res => {
                          var resJson = res.json()
                          this.lang = resJson['data']['lan_flag']
                          this.langName = resJson['data']['lan_name']
                        }
                      )
                    }
                  )
                })
              }
            )
          }
        },
        {
          text: 'LOGOUT',
          role: 'destructive',
          handler: () => {
            this.globalService.loading('Logout...')
            this.globalService.dispatch(this.userAction.removeUserData())
            this.globalService.dispatch(this.userAction.closeOfflineMode())
            this.globalService.removeFromStorage('@user:data')
            this.globalService.setToStorage('@user:signIn' , false)
            this.globalService.loaded()
            
            setTimeout(()=>{
              this.navCtrl.setRoot(AuthenticatePage)
              // this.globalService.clearStorage()
              this.globalService.setCurrentRoute('login')
            },1000)
          }
        },
        {
          text: 'CANCEL',
          role: 'cancel',
          handler: () => {
          }
        },
      ]
    })
    actionSheet.present()
  }

  ngOnDestroy(){
    // this.subScription.unsubscribe()
  }

}
