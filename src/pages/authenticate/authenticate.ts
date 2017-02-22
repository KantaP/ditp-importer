import { Component ,OnDestroy , NgZone} from '@angular/core';
import { NavController } from 'ionic-angular';
import { Response } from '@angular/http';
import { FormGroup , FormBuilder  } from '@angular/forms';
import { HomePage } from '../home/home';
import { Subscription } from 'rxjs/Subscription';
import { UserActions } from '../../actions/user.actions';
import { User } from '../../models/user.model';
import { AuthenticateService } from '../../services/authenticate.service';
import { GlobalService } from '../../services/global.service';

/*
  Generated class for the Authenticate page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-authenticate',
  templateUrl: 'authenticate.html'
})
export class AuthenticatePage implements  OnDestroy{


  authenticateForm: FormGroup
  userData: User
  subScription: Subscription
  signIn: boolean

  constructor(
    public navCtrl: NavController,
    private authenticateService: AuthenticateService,
    private fb: FormBuilder,
    private userActions: UserActions,
    private globalService: GlobalService,
    private _ngzone: NgZone
  ) {
    this.authenticateForm = this.fb.group({
      username: '' ,
      password: '',
      remember: true
    })
    this.signIn = false
  }

  ionViewDidLoad() {
    // this.globalService.clearStorage()
    this.globalService.getFromStorageAsync('@user:signIn') 
    .then(res => {
      //  console.log(res)
       if(res) this.signIn = true
       else this.signIn = false
      //  console.log(this.signIn)
       this._ngzone.runOutsideAngular(()=>{
          setTimeout(()=>{
            if(this.signIn) {
              this.checkFromStorage()
              .subscribe(res => {
                this._ngzone.run(()=>{
                  // console.log(res)
                  if(res) {
                    // console.log(res)
                    this.authenticateForm.patchValue({
                      username: res.use_username ,
                      password: res.use_password,
                      remember: true 
                    })
                    // console.log(this.authenticateForm)
                    this.gotoHomePage()
                  } 
                })
              })
            }
          },100)
        })
    })


    
  } 
 
  checkFromStorage() { 
    return this.globalService.getFromStorage('@user:data')
  }

  enableOfflineMode() {
    this.globalService.getFromStorageAsync('@user:data')
    .then( 
      res => {
        if(res) {
          this.globalService.dispatch(this.userActions.addUserData(res))
          this.globalService.dispatch(this.userActions.useOfflineMode())
          this.navCtrl.setRoot(HomePage)
          this.globalService.setCurrentRoute('home')
        }else{
          this.globalService.basicAlert('Warning' , 'This is your first time to use this app , please login in online mode')
        }
      }
    )

  }
  
  gotoHomePage(){
    this.globalService.loading('Authenticate...')
    var username = this.authenticateForm.controls['username'].value
    var password = this.authenticateForm.controls['password'].value
    setTimeout(()=>{
    this.subScription = this.authenticateService.signIn(username , password)
    .subscribe( 
      res => this.signInSuccess(res) ,
      err => this.globalService.basicAlert('Error' , err) 
    )} , 1000)
  }
  
  signInSuccess(res: Response) { 
    var resJson = res.json()
    
    if(resJson.data.length > 0) {
      resJson.data.map((data)=>{
        if(data.chk_status == 'Y') {
          this.userData = Object.assign({use_password: this.authenticateForm.controls['password'].value} , this.userData , resJson.data[0])
          setTimeout(()=> {
          this.subScription = this.authenticateService.userProfile(this.userData.use_id)
          .subscribe(
            res => this.getProfileSuccess(res) , 
            err => this.globalService.basicAlert('Error' , err)
            
          )} , 1000)
        }else{ 
          this.globalService.loaded()
          this.globalService.basicAlert('Authenticate' , data.msgs)
        }
      })
    }  
  }

  getProfileSuccess(res: Response) {
    var resJson = res.json()
    this.userData = Object.assign({} , this.userData , resJson.data)
    if(this.authenticateForm.controls['remember'].value) {
      this.globalService.setToStorage('@user:data' , this.userData)
      this.globalService.setToStorage('@user:signIn' , true)
    }
    this.globalService.dispatch(this.userActions.addUserData(this.userData))
    this.globalService.loaded()
    this.navCtrl.setRoot(HomePage)
    this.globalService.setCurrentRoute('home')
  }

  ngOnDestroy () {
    if(this.subScription) this.subScription.unsubscribe()
  }

}
