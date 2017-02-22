import { Component , OnInit , OnDestroy} from '@angular/core';
import { NavController , Tabs , NavParams , App } from 'ionic-angular';
import * as moment from 'moment'
import { NoteNeed , NoteNeedImage } from '../../models/importer.model';
import { GlobalService } from '../../services/global.service';
import { ImporterService } from '../../services/importer.service';
import { ImporterActions } from '../../actions/importer.actions';
import { HomePage } from '../home/home'
/*
  Generated class for the FifthStep page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-fifth-step',
  templateUrl: 'fifth-step.html'
})
export class FifthStepPage implements OnInit , OnDestroy{

  today: any
  noteNeedForm : NoteNeed
  noteNeedImages: Array<NoteNeedImage>
  companyProfile: any
  alreadyAddCompany: boolean
  offlineMode: any
  keyForm: any

  constructor(
    public navCtrl: NavController,
    private globalService: GlobalService,
    private importerService: ImporterService,
    private importerActions: ImporterActions,
    private tab: Tabs ,
    private _navParams: NavParams ,
    private app: App
  ) {
    this.today = moment().format('DD MMMM YYYY')
    this.noteNeedForm = {
      comn_title: '',
      comn_note: ''
    }
    // this.noteNeedImages = [
    //   {
    //     comni_image_name: 'assets/images/test1.jpg'
    //   },
    //   {
    //     comni_image_name: 'assets/images/test1.jpg'
    //   },
    //   {
    //     comni_image_name: 'assets/images/test1.jpg'
    //   },
    //   {
    //     comni_image_name: 'assets/images/test1.jpg'
    //   },
    // ]
  }

  ngOnInit() {
    this.globalService.select('importerState').subscribe(res => {
      this.alreadyAddCompany = res.alreadyAddCompanyProfile
      this.noteNeedImages = res.importerData.noteNeedImage
      this.companyProfile = res.importerData.CompanyProfile
      // console.log(this.noteNeedImages)
    })
    if(typeof this._navParams.data !== 'undefined') {
      if(this._navParams.data['offlineMode']) {
        this.offlineMode = true
        this.keyForm = this._navParams.data['keyForm']
        this.globalService.getFromStorageAsync('@importer:offline') 
        .then(
          res => {
            if(this._navParams.data.hasOwnProperty('index_id')){
              this.noteNeedForm = res[this._navParams.data['index_id']].noteNeed
              this.noteNeedImages = res[this._navParams.data['index_id']].noteNeedImages
            }
          }
        )
      }
    }
  }

  backToHome(){
    this.globalService.setCurrentRoute('home')
    this.globalService.dispatch(this.importerActions.resetState())
    // console.log(this.navCtrl.parent)
    // this.navCtrl.parent.setRoot(HomePage)
    this.app.getRootNav().setRoot(HomePage)

  }

  saveNoteNeed () {
    if(this.offlineMode) {
      
      this.globalService.getFromStorageAsync('@importer:offline')
      .then(
        (res:Array<any>) => {
          this.globalService.loading('Saving...')
          let newData = {
            noteNeed: this.noteNeedForm,
            noteNeedImages: this.noteNeedImages
          }
          let index = res.findIndex(item => item.keyForm == this.keyForm)
          let newRes = res[index]
          if(!res[index].hasOwnProperty('companyProfile')) {
            this.globalService.loaded() 
            this.globalService.basicAlert('Warning' , 'Please input company profile')
            return false
          }
          newRes = Object.assign({} , newRes , newData)
          res[index] = newRes
          this.globalService.setToStorage('@importer:offline' , res)    
          this.globalService.loaded()    
          this.globalService.basicAlert('Note Need' , res[index].companyProfile.com_name_en + ' has been saved')
          this.backToHome()   
        }
      )
    }else{
      if(this.alreadyAddCompany || this._navParams.data['force_update']){
        this.globalService.loading('Saving...')
        if(this.noteNeedForm['comn_note'] !== "") {

          this.globalService.dispatch(this.importerActions.setNoteNeedAll(this.noteNeedForm))
          .then(()=>{
              this.importerService.insertNoteNeed().subscribe(
                res => {
                  this.globalService.loaded()
                  this.globalService.promiseBasicAlert('Note Need' , res.data[0].msgs + '\n' + this.companyProfile.com_name_en)
                  .then(
                    res => {
                      if(res == 'ok') {
                        setTimeout(()=>this.backToHome() , 1000)
                      }
                    }
                  )
                  //this.globalService.dispatch(this.importerActions.resetState())
                  //this.tab.select(0)
                  
                },
                error => {
                  this.globalService.loaded()
                  this.tab.select(0)
                }
            )  
          })
          .catch(err => {
            this.globalService.loaded()
            // this.globalService.basicAlert('Error','Please add company profile.')
            this.tab.select(0)
          })
        }else{
          this.globalService.loaded()
          this.globalService.promiseBasicAlert('Note Need' , "Save " + this.companyProfile.com_name_en + " success")
          .then(
            res => {
              if(res == 'ok') {
                setTimeout(()=>this.backToHome() , 1000)
              }
            }
          )
        }
        
        //this.globalService.dispatch(this.importerActions.resetState())
      }else{
        this.globalService.basicAlert('Error','Please add company profile.')
        this.tab.select(0)
      }
    }
  }

  selectImageNoteNeed() {
    this.globalService.imageActionSheet('note_need')
  }

  deleteImaeNoteNeed(comni_image_name) {
    this.noteNeedImages = this.noteNeedImages.filter(item => item.comni_image_name !== comni_image_name)
    this.globalService.dispatch(this.importerActions.setNoteNeedImageAll(this.noteNeedImages))
  }

  ngOnDestroy(){
    this.today = moment().format('DD MMMM YYYY')
    this.noteNeedForm = {
      comn_title: '',
      comn_note: ''
    }
  }

}
