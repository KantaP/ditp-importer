import { Component  , OnDestroy , OnInit } from '@angular/core';
import { NavController , Tabs , NavParams} from 'ionic-angular';
import { GlobalService } from '../../services/global.service' ;
import { ImporterActions } from '../../actions/importer.actions';
import { ImporterService } from '../../services/importer.service'; 
import { PersonContact } from '../../models/importer.model'
/*
  Generated class for the ForthStep page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-forth-step',
  templateUrl: 'forth-step.html'
})
export class ForthStepPage implements OnDestroy , OnInit{

  view = 'select' ;
  contactPersonForm : PersonContact
  prefix: any
  userData: any
  contactList: any
  updateContact: boolean
  alreadyAddCompany: boolean
  updateMode: boolean
  offlineMode: any
  keyForm: any
  forceUpdate: boolean

  constructor(
    public navCtrl: NavController ,
    private globalService: GlobalService,
    private importerActions : ImporterActions,
    private importerService : ImporterService,
    private tab: Tabs ,
    private _navParams : NavParams
    ) {
    this.contactPersonForm = {
      pre_id: 0 ,
      comc_firstname: '',
      comc_lastname: '',
      comc_middlename: '',
      comc_position: '',
      comc_contact_number: '',
      comc_email: '',
      comc_picture: '',
      comc_namecard_front: '',
      comc_namecard_back: '',
      title_name: '',
      comc_id: 0
    }
    // this.contactList = [
    //     {
    //         "comc_id": 3761,
    //         "title_name": "Miss.",
    //         "comc_picture": "http://112.121.150.4/ditp/uploads/1480191938-5tcax-1v0df.jpg",
    //         "comc_firstname": "Nijanoz",
    //         "comc_middlename": "Hisnnmx",
    //         "comc_lastname": "Jinxnnna",
    //         "comc_position": "Jubskkz",
    //         "comc_contact_number": "9865527",
    //         "comc_email": "Jkckvj@gnail.com",
    //         "comc_namecard_front": "http://112.121.150.4/ditp/uploads/1480191938-nukmh-900wb.jpg",
    //         "comc_namecard_back": "http://112.121.150.4/ditp/uploads/1480191938-sus2l-wp2co.jpg"
    //     }
    // ]
    this.contactList = []
    this.updateContact = false
    this.forceUpdate = false
    this.updateMode = false
  }

  ngOnInit() {
    this.globalService.getFromStorage('@prefix:list').subscribe(res => {
      if(res) {
          this.prefix = res
        }
    })

    if(typeof this._navParams.data !== 'undefined') {
      if(!this._navParams.data['offlineMode'] && this._navParams.data['key_visit'])  this.updateMode = true
      else if(this._navParams.data['force_update']) this.forceUpdate = true
      else if(this._navParams.data['offlineMode']) {
        this.offlineMode = true
        this.keyForm = this._navParams.data['keyForm']
        
      }
    }

    this.globalService.select('userState').subscribe(res => this.userData = res.data)

    this.globalService.select('importerState').subscribe(res => {
      this.alreadyAddCompany = res.alreadyAddCompanyProfile
      this.contactPersonForm = res.importerData.contactPerson
    })

    if(this.updateMode || this.forceUpdate) {
      this.importerService.getListContactFollowUp(this._navParams.data.com_id)
      .subscribe(
        res => {
          var resJson = res.json()
          this.contactList = resJson.data
          console.log('updatemode' , this.contactList)
        }
      )
    }else if(this.offlineMode){
      this.globalService.getFromStorageAsync('@importer:offline') 
      .then(
        res => {
          if(this._navParams.data.hasOwnProperty('index_id')){
            this.contactList = res[this._navParams.data['index_id']].contactPersons
            console.log('offlinemode' , this.contactList)
          }
        }
      )
    }
    else{
      this.importerService.getListContact().subscribe( res => {
        if(res){
          var resJson = res.json()
          if(resJson['data'].length > 0) this.contactList = res
          console.log('normalmode' , this.contactList)
          // else this.globalService.basicAlert('Error' , res[0]['msgs'])
        }
      })
    }
    
  }

  searchContact(e) {
    if(this.updateMode) {
      this.importerService.getListContactFollowUp(this._navParams.data , e.target.value)
      .subscribe(
        res => {
          var resJson = res.json()
          this.contactList = resJson.data
        }
      )
    }else{
      this.importerService.getListContact(e.target.value).subscribe( res => {
        if(res){
          if(!res[0]["error"]) this.contactList = res
          // else this.globalService.basicAlert('Error' , res[0]['msgs'])
        }
      })
    }

  }

  deleteContact(comc_id:number) {
    if(this.offlineMode) {
      this.contactList = this.contactList.filter(item => item.comc_id !== comc_id) 
      this.globalService.getFromStorageAsync('@importer:offline')
      .then(
        (res:Array<any>) => {
          var newData = {
            contactPersons: this.contactList
          }
          let index = res.findIndex(item => item.keyForm == this.keyForm)
          let newRes = res[index]
          newRes = Object.assign({} , newRes , newData)
          res[index] = newRes
          this.globalService.setToStorage('@importer:offline' , res)           
        }
      )
    }else{
      this.importerService.deleteContact(comc_id).subscribe( res => {
        if(this.updateMode) {
          this.importerService.getListContactFollowUp(this._navParams.data)
          .subscribe(
            res => {
              var resJson = res.json()
              this.contactList = resJson.data
            }
          )
        }else{
          this.importerService.getListContact().subscribe( res => {
            if(res){
              if(res[0]["comc_id"]) this.contactList = res
              // else this.globalService.basicAlert('Error' , res[0]['msgs'])
            }
          })
        }
      })
    }
  }

  selectLogoImage() {
    this.globalService.imageActionSheet('person_picture') 
  }

  selectFrontImage() {
    this.globalService.imageActionSheet('person_front') 
  }

  selectBackImage () {
    this.globalService.imageActionSheet('person_back') 
  }

  saveContactPerson() {
    if(this.alreadyAddCompany || this.forceUpdate){
      console.log(this.updateContact , this.updateMode)
      if(this.updateContact) {
        if(!this.updateMode) {
          this.globalService.loading('Updating...')
          this.globalService.dispatch(this.importerActions.setContactPersonAll(this.contactPersonForm))
          .then(()=>{
            this.importerService.updateContact().subscribe(res =>{
              this.globalService.loaded()
              this.globalService.basicAlert('Contact Person' , res.data[0].msgs)
              this.importerService.getListContact().subscribe( res => {
                if(res[0].comc_id) this.contactList = res
              })
              this.contactPersonForm = {}
              this.updateContact = false
            },
            error => this.globalService.loaded(),
            () => this.globalService.loaded()
            )
          })
          .catch(err => {
            this.globalService.loaded()
            this.tab.select(0)
          })
        }else{
          this.globalService.loading('Updating...')
          this.importerService.InsertContactFromFollowUp(this._navParams.data , this.contactPersonForm)
          .subscribe(
              res => {
                var resJson = res.json()
                console.log(resJson)
              },
              err => {} ,
              () => this.globalService.loaded()
            )
        }
        
      }
      else{
        this.globalService.loading('Saving...')
        this.globalService.dispatch(this.importerActions.setContactPersonAll(this.contactPersonForm))
        .then(()=>{
          if(!this.updateMode && !this.forceUpdate) {
            this.importerService.insertContactPerson().subscribe( 
            res => {
                this.globalService.loaded()
                this.globalService.basicAlert('Contact Person' , res.data[0].msgs)
                this.importerService.getListContact().subscribe( res => {
                  if(res[0].comc_id) this.contactList = res
                })
                this.contactPersonForm = {}
            },
            error => {
              this.globalService.loaded() 
              console.log(error)
            },
            () => this.globalService.loaded()
            )
          }else{
            var com_id
            if(typeof this._navParams.data == 'object') com_id = this._navParams.data['com_id']
            else com_id = this._navParams.data
            this.importerService.InsertContactFromFollowUp(com_id , this.contactPersonForm)
            .subscribe(
              res => {
                var resJson = res.json()
                this.contactPersonForm = {}
                this.globalService.loaded()
                this.globalService.basicAlert('Contact Person' , resJson.data[0].msgs)
                
              },
              err => {} ,
              () => this.globalService.loaded()
            )
          }
          
        })
        .catch( err => {
          this.globalService.loaded()
          this.tab.select(0)
          // this.globalService.basicAlert('Error','Please add company profile.')
        })
      }
    }else if(this.offlineMode) {
        if(
        (this.contactPersonForm.comc_firstname !== '') &&
        (this.contactPersonForm.comc_lastname !== '') &&
        (this.contactPersonForm.comc_email !== '') &&
        (this.contactPersonForm.comc_contact_number !== '') &&
        (this.contactPersonForm.pre_id !== 0)  
        ) {
          this.globalService.loading('Saving...')
          this.globalService.getFromStorageAsync('@importer:offline')
          .then(
            (res:Array<any>) => {
              var newData = {}
              let index = res.findIndex(item => item.keyForm == this.keyForm)
              this.contactPersonForm.title_name = this.prefix.filter(item => item.pre_id == this.contactPersonForm.pre_id)[0].title_name
              
              if(res[index].hasOwnProperty('contactPersons')) {
                this.contactPersonForm.comc_id = res[index].contactPersons.length + 1
                var oldArr = res[index].contactPersons
                oldArr.push(this.contactPersonForm)
                newData = {
                  contactPersons: oldArr
                }
                this.contactList = oldArr
              }else{
                this.contactPersonForm.comc_id = 1
                var arr = []
                arr.push(this.contactPersonForm)
                newData = {
                  contactPersons: arr
                }
                this.contactList = arr
              }
              let newRes = res[index]
              newRes = Object.assign({} , newRes , newData)
              res[index] = newRes
              this.globalService.setToStorage('@importer:offline' , res)
              this.globalService.loaded()
              this.contactPersonForm = {
                pre_id: 0 ,
                comc_firstname: '',
                comc_lastname: '',
                comc_middlename: '',
                comc_position: '',
                comc_contact_number: '',
                comc_email: '',
                comc_picture: '',
                comc_namecard_front: '',
                comc_namecard_back: '',
                title_name: '',
                comc_id: 0
              }
            }
          )
        }else {
          this.globalService.basicAlert('Warning' , 'Please input prefix , first name , last name , email and contact number')
        }
        
    }
    else{
      this.globalService.basicAlert('Error','Please add company profile.')
      this.tab.select(0)
    }
    
    
  }

  editContactPerson(contactData) {
    this.contactPersonForm = contactData
    this.contactPersonForm.pre_id = this.findPrefixTitle(contactData.title_name)
    // this.globalService.dispatch(this.importerActions.setContactPersonAll(this.contactPersonForm))
    this.updateContact = true
    this.view = 'add'
  }

  findPrefixTitle(title_name: string) {
    return this.prefix.filter(item => item.pre_title == title_name)[0].pre_id
  }

  ngOnDestroy(){
    this.contactPersonForm = {
      pre_id: 0 ,
      comc_firstname: '',
      comc_lastname: '',
      comc_middlename: '',
      comc_position: '',
      comc_contact_number: '',
      comc_email: '',
      comc_picture: '',
      comc_namecard_front: '',
      comc_namecard_back: '',
      title_name: '',
      comc_id: 0
    }
    this.contactList = []
    this.updateContact = false
  }

}
