import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Http  , Headers , RequestOptions } from '@angular/http';
import { HomePage } from '../home/home'
import { Camera , Transfer } from 'ionic-native';
import { GlobalService } from '../../services/global.service';
import { API_LINK } from '../../services/config';
import { AuthenticateService } from '../../services/authenticate.service';
import { UserActions } from '../../actions/user.actions';

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfilePage {

  name:string
  lastname:string
  email:string
  picture:any
  position:string
  mobile:string
  country:string
  address:string
  userID: number
  countryData:any
  userData:any

  constructor(public navCtrl: NavController , private globalService: GlobalService , private http: Http , private _auth :AuthenticateService , private userActions : UserActions) {
    this.globalService.getFromStorageAsync('@user:data')
    .then(
      (res) => {
        this.userData = res
        this.name = res['mem_name']
        this.lastname = res['mem_lastname']
        this.position = res['mem_position']
        this.email = res['use_email']
        this.mobile = res['tel']
        this.picture = res['mem_picture']
        this.country = res['country']
        this.address = res['ttc']
        this.userID = res['use_id']
      }
    )
  }

  selectImage() {
    var options = {
        quality: 50,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: 0,      // 0:Photo Library, 1=Camera, 2=Saved Photo Album
        encodingType: 0,     // 0=JPG 1=PNG 
        correctOrientatin: true,
        allowEdit: true,
    };
    Camera.getPicture(options).then((FILE_URI) => {
      this.picture = FILE_URI
    })
  }

  saveProfile(){
    var url =  encodeURI(API_LINK + 'setting_profile.php');
    // console.log(this.picture.includes('http'))
    if(!this.picture.includes('http')) {
      //save with image
      var fileTransfer = new Transfer()
      var options: any = {
          fileKey: "mem_picture",
          fileName: this.picture.substr(this.picture.lastIndexOf('/') + 1),
          httpMethod: "POST",
          mimeType: "image/jpeg",
          params: {
              sessionID: this.userID ,
              action: "update",
              use_email: this.email,
              mem_name: this.name,
              mem_lastname: this.lastname,
              mem_position: this.position,
              mem_mobile: this.mobile
          }, 
          chunkedMode: false
      };
      // console.log(options)
      fileTransfer.upload(this.picture , url ,options)
      .then(
        res => {
          // console.log(res)
          var responseJson:any = JSON.parse(res.response);
          this.globalService.basicAlert('Result' , responseJson['data']['msgs'])
        }
      )
    }else{
      //save without image
      let bodyString = `sessionID=${this.userID}&action=update&`
      bodyString += `use_email=${this.email}&mem_name=${this.name}&mem_lastname=${this.lastname}&mem_position=${this.position}&mem_mobile=${this.mobile}`
      let headers      = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
      let options       = new RequestOptions({ headers: headers });
      this.http.post(API_LINK + `setting_profile.php` , bodyString , options)
      .subscribe(
        res => {
          var resJson = res.json()
          this.globalService.basicAlert('Result' , resJson['data']['msgs'])
        }
      )
    }
    this.userData['mem_name'] = this.name
    this.userData['mem_lastname'] = this.lastname
    this.userData['use_email'] = this.email
    this.userData['mem_position'] = this.position
    this.userData['mem_mobile'] = this.mobile
    this.userData['mem_picture'] = this.picture
    this.globalService.setToStorage('@user:data' , this.userData)
    this.globalService.dispatch(this.userActions.addUserData(this.userData))
  }


  backToHome() {
    this.navCtrl.setRoot(HomePage)
  }

}
