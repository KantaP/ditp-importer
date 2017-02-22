import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { GlobalService } from '../../services/global.service';
import { ImporterService } from '../../services/importer.service';
import { HomePage } from '../home/home';
import * as moment from 'moment'

interface GroupList {
  favg_id: number;
  favg_name: string;
  createdate: string;
}
/*
  Generated class for the GroupView page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-group-view',
  templateUrl: 'group-view.html'
})
export class GroupViewPage {

  viewGroup: string
  groupList: Array<GroupList>
  _moment: any
  favg_insert_name: string

  constructor(
    public navCtrl: NavController,
    private globalService: GlobalService,
    private importerService: ImporterService
    ) {
      this.viewGroup = "view"
      this._moment = moment;
      this.favg_insert_name = ""
      this.groupList = []
    }
  ionViewWillEnter() { 
    setTimeout(()=>{
      this.globalService.loading('Loading...')
      this.loadFavorite()
    },200)
    
  }

  loadFavorite(key:string = "") {
    this.importerService.searchFavorite(key)
    .subscribe(
      res => {
        var resJson = res.json()
        this.groupList = resJson.data
        this.globalService.loaded()
      },
      err => {
        this.globalService.loaded()
      }
    )
  }

  favoriteInsert() {
    if(this.favg_insert_name == '') {
      this.globalService.basicAlert('Validate' , 'Please input your group name')
      return false;
    }
    this.globalService.loading('Saving...')
    setTimeout(()=>{
      this.importerService.favoriteInsert(this.favg_insert_name)
      .subscribe(
        res => {
          var resJson = res.json()
          this.globalService.loaded()
          this.globalService.basicAlert('Result' , resJson.data.msgs)
          var mock = []
          mock.push({
            favg_id: resJson.data.favg_id ,
            favg_name: this.favg_insert_name ,
            createdate: moment().format('YYYY-MM-DD HH:mm')
          })
          var mock2 = this.groupList
          this.groupList = mock
          this.groupList = this.groupList.concat(mock2)
          this.favg_insert_name = ""
          this.viewGroup = "view"
        },
        err => {
          console.error(err)
          this.globalService.loaded()
        }
      )
    },200)
  }

  deleteGroup(favg_id){
    this.globalService.confirmAlert('Confirm' , 'Are you want to delete this group ?')
    .then(res => {
       if(res) {
         this.importerService.deleteFavorite(favg_id)
         .subscribe(
           res => {
             var resJson = res.json()
             this.globalService.basicAlert('Result' , resJson.data.msgs)
             if(resJson.data.chk_status == 'Y') {
               this.groupList = this.groupList.filter(item => item.favg_id !== favg_id)
             }
           }
         )
       }
    })
  }

  updateGroup(favg_id) {
    var inputs = [
      {
        name:'favg_name' ,
        title: 'Favorite group name'
      }
    ]
    this.globalService.promptAlert('Edit favorite' , 'Enter a name for edit this favorite' , inputs)
    .then( data => {
      if(data) {
        this.importerService.updateFavorite(favg_id , data['favg_name'])
        .subscribe(
          res => {
            var resJson = res.json()
            this.globalService.basicAlert('Result' , resJson.data.msgs)
            if(resJson.data.chk_status == 'Y') {
              var index = this.groupList.findIndex(item => item.favg_id == favg_id)
              this.groupList[index].favg_name = data['favg_name']
            }
          }
        )
      }
    })
  }

  searchFavorite(ev:any) {
    let val = ev.target.value
    this.loadFavorite(val)
  }

  backToHome(){
    this.navCtrl.setRoot(HomePage)
  }
}
