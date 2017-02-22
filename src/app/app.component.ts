import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar, Splashscreen , Keyboard} from 'ionic-native';
// import { enableProdMode } from '@angular/core';
import { AuthenticatePage } from '../pages/authenticate/authenticate';
// import { ImporterListPage } from '../pages/importer-list/importer-list'
// import { FollowUpPage } from '../pages/follow-up/follow-up'
// import { HomePage } from '../pages/home/home';
// import { ImporterPage } from '../pages/importer/importer';




@Component({
  template: `<ion-nav [root]="rootPage"></ion-nav>`
}) 
export class MyApp { 
  rootPage = AuthenticatePage;
   
  

  constructor(
    platform: Platform,
    
  ) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      Splashscreen.hide();
      Keyboard.hideKeyboardAccessoryBar(false);
    });
  }
}
