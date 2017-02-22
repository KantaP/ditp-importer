import { Component , OnInit} from '@angular/core';
import { NavController , NavParams } from 'ionic-angular';
import { HomePage } from '../home/home';

import { FirstStepPage } from '../first-step/first-step';
import { SecondStepPage } from '../second-step/second-step';
import { ThirdStepPage } from '../third-step/third-step';
import { ForthStepPage } from '../forth-step/forth-step';
import { FifthStepPage } from '../fifth-step/fifth-step';

import { GlobalService } from '../../services/global.service';
import { ImporterActions } from '../../actions/importer.actions';

import { RouteState } from '../../reducers/route.reducer';
import * as moment from 'moment'
/*
  Generated class for the Importer page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'importer.html'
})
export class ImporterPage  implements OnInit{

  step1Root: any = FirstStepPage
  step2Root: any = SecondStepPage
  step3Root: any = ThirdStepPage
  step4Root: any = ForthStepPage
  step5Root: any = FifthStepPage

  stepImages: Array<string>
  stepActiveImages: Array<string>

  routeState: RouteState

  title:string

  paramComId: number
  params: any

  constructor(
    public navCtrl: NavController,
    private globalService: GlobalService,
    private importerActions: ImporterActions ,
    private navParams :NavParams
    ){
      this.params = {}
    }

  ngOnInit() {
    this.globalService.select('routeState').subscribe( res => {
      this.routeState = res
      // console.log(this.routeState)
    })

    this.params = this.navParams.data
    if(this.params['offlineMode']) {
      if(!this.params.hasOwnProperty('index_id')) {
        this.params.keyForm = moment().format('YYYY-MM-DD-HH:mm')
        this.globalService.getFromStorageAsync('@importer:offline')
        .then(
          (res:Array<any>) => {
            let newData = {
              keyForm: this.params.keyForm
            }
            let newRes = res.concat([newData])
            let cloneRes = newRes
            this.globalService.setToStorage('@importer:offline' , cloneRes)
          }
        )
      }else{
        this.globalService.dispatch(this.importerActions.addCompanySuccess());
      }
    } 
    // console.log(this.params)
    if(this.paramComId > 0) this.globalService.dispatch(this.importerActions.addCompanySuccess());

  }

  backToHome(){
    this.globalService.setCurrentRoute('home')
    this.globalService.dispatch(this.importerActions.resetState())
    .then(()=>{
      this.navCtrl.setRoot(HomePage)
    })
  }

  setTitle(title: string , route: string , e:any) {
    this.title = title
    this.globalService.setCurrentRoute(route)
  }

  popRoute(){
    this.navCtrl.pop()
  }

}
