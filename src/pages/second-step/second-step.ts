import { Component , OnInit , OnDestroy} from '@angular/core';
import { NavController , Tabs , NavParams } from 'ionic-angular';
import { ImporterActions } from '../../actions/importer.actions';
import { ImporterService } from '../../services/importer.service';
import { GlobalService } from '../../services/global.service';
import { Business } from '../../models/importer.model';
import * as _ from 'lodash';
// import { ThirdStepPage }  from '../third-step/third-step';
/*
  Generated class for the SecondStep page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-second-step',
  templateUrl: 'second-step.html'
})
export class SecondStepPage implements OnInit , OnDestroy{

  businesses: Array<Array<Business>>
  keyForm: string
  selected: Array<any> 
  alreadyAddCompany: boolean
  updateMode: boolean
  businessStore : any
  offlineMode: any
  // importerState: any

  constructor(
    public navCtrl: NavController,
    private globalService: GlobalService,
    private importerActions: ImporterActions,
    private importerService: ImporterService,
    private tab:Tabs,
    private _navParams:NavParams
  ) {
    this.selected = [] 
    this.keyForm = ''
    this.businessStore = []
    // this.globalService.select('importerState').subscribe(res => this.importerState = res)
    this.globalService.getFromStorage('@business:add:'+this.keyForm).subscribe( res => { 
      if(res) this.selected = res
    })
    
    this.globalService.getFromStorage('@business:list').subscribe( res => {
      if(res) {
        this.businesses = _.chunk(res, 3);
      }
    })

    

    this.globalService.select('importerState').subscribe(res => {
      this.alreadyAddCompany = res.alreadyAddCompanyProfile
      this.businessStore = res.importerData.businessType
    })

    if(typeof this._navParams.data !== 'undefined') {
      if(!this._navParams.data['offlineMode'] && (this._navParams.data['key_visit'] || this._navParams.data['force_update']))  this.updateMode = true
      else if(this._navParams.data['offlineMode']) {
        this.offlineMode = true
        this.keyForm = this._navParams.data['keyForm']
      }
    }
  }

  ngOnInit(){
    
  }

  checkIfSelected(bus_type , bus_id) {
    let check = false
    this.businessStore.map((item , index) => {
      if(item.bus_type == bus_type) check =true
      else if(parseInt(item) == bus_id) check = true
    })
    return check
  }

  // onSelected(value) {
  //   if(this.selected.indexOf(value) === -1) return false
  //   else return true
  // }

  onChange(e){
    if(e.checked) {
      this.selected.push(e.value)
      if(this.updateMode) this.importerService.updateBusinessType(this._navParams.data.com_id , this._navParams.data.key_visit , e.value , "set")
    }else{
      this.selected = this.selected.filter( item => item !== e.value)
      if(this.updateMode) this.importerService.updateBusinessType(this._navParams.data.com_id , this._navParams.data.key_visit , e.value , "unset")
    }
  }

  generateBusObject() {
    var obj = []
    for(let item of this.selected) {
      obj.push({
        bus_type: item
      })
    }
    return obj
  }

  gotoThirdStep() {
    
    if(this.updateMode) {
      this.tab.select(2);
    }else if(this.offlineMode) {
      if(this.selected.length == 0) {
        this.globalService.basicAlert('Warning' , 'Please select type of business') 
      }else{
        this.globalService.getFromStorageAsync('@importer:offline')
        .then(
          (res:Array<any>) => {
            let newData = {
              keyForm: this.keyForm ,
              typeOfBusiness: this.selected
            }
            let index = res.findIndex(item => item.keyForm == this.keyForm) 
            let newRes = res[index]
            newRes = Object.assign({} , newRes , newData)
            res[index] = newRes
            this.globalService.setToStorage('@importer:offline' , res)
            this.globalService.setCurrentRoute('thirdStep')
            this.tab.select(2);
          }
        )
      }
    }
    else{
      if(this.alreadyAddCompany) {
          this.globalService.getFromStorage('@business:add:'+this.keyForm).subscribe( res => {
            if(res) {
              var mergeItem = res.concat(this.selected)
              this.globalService.dispatch(this.importerActions.setBusinessType(mergeItem))
              // this.globalService.setToStorage('@business:add:'+this.keyForm , mergeItem)
            }else {
              this.globalService.dispatch(this.importerActions.setBusinessType(this.selected))
              // this.globalService.setToStorage('@business:add:'+this.keyForm , this.selected)
            }
            // console.log(this.importerState)
            // console.log('@business:add:'+this.keyForm)
            this.importerService.insertBusinessType()
          })
        this.tab.select(2);
      }else{
        this.globalService.basicAlert('Error','Please add company profile.')
        this.tab.select(0)
      }
    }
    
    
    
    // this.navCtrl.setRoot(ThirdStepPage)
  }

  ngOnDestroy() {
    this.selected = [] 
    this.keyForm = ''
  }

  clickLabel(e) {
    e.click()
  }
 
}
