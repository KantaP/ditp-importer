import { Component } from '@angular/core';
import { NavController , NavParams } from 'ionic-angular';
import { GlobalService } from '../../services/global.service';

import { ListViewPage } from '../list-view/list-view';
import { GroupViewPage } from '../group-view/group-view';
import { HomePage } from '../home/home';
/*
  Generated class for the ImporterList page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-importer-list',
  templateUrl: 'importer-list.html'
})
export class ImporterListPage {

  listView: any = ListViewPage
  groupView: any = GroupViewPage
  title: string
  titleFix: string

  constructor(
    public navCtrl: NavController ,
    private globalService: GlobalService ,
    private _navParams: NavParams
  ) {
    this.title = 'IMPORTER LIST'
    this.titleFix = ""
    if(this._navParams.data['title']) this.titleFix = this._navParams.data['title']
    console.log(this._navParams.data)
  }

  ionViewDidLoad() {
    //console.log('Hello ImporterListPage Page');
  }

  ionViewWillEnter() {
    // setTimeout(()=>{
    //   this.globalService.basicAlert('test' ,'test')
    // }, 1000)
  }

  backToHome(){
    this.navCtrl.setRoot(HomePage)
  }

  setTitle (title) {
    this.title = title
  }

}
