import { NgModule , ErrorHandler , CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicApp, IonicModule , IonicErrorHandler } from 'ionic-angular';
import { ReactiveFormsModule }   from '@angular/forms';
import { HttpModule, JsonpModule } from '@angular/http';

import { MyApp } from './app.component';
import { AuthenticatePage } from '../pages/authenticate/authenticate'
import { HomePage } from '../pages/home/home';
import { ImporterPage } from '../pages/importer/importer';
import { FirstStepPage } from '../pages/first-step/first-step';
import { SecondStepPage } from '../pages/second-step/second-step';
import { ThirdStepPage } from '../pages/third-step/third-step';
import { ForthStepPage } from '../pages/forth-step/forth-step';
import { FifthStepPage } from '../pages/fifth-step/fifth-step';
import { CategoriesPage } from '../pages/categories/categories';
import { SubcategoriesPage } from '../pages/subcategories/subcategories';
import { GoogleMapPage } from '../pages/google-map/google-map';
import { ImporterListPage } from '../pages/importer-list/importer-list';
import { ListViewPage } from '../pages/list-view/list-view';
import { GroupViewPage } from '../pages/group-view/group-view';
import { AdvanceSearchPage } from '../pages/advance-search/advance-search';
import { ImporterDetailPage } from '../pages/importer-detail/importer-detail';
import { FollowUpPage } from '../pages/follow-up/follow-up';
import { FollowUpDetailPage } from '../pages/follow-up-detail/follow-up-detail';
import { MyPortfolioPage } from '../pages/my-portfolio/my-portfolio';
import { PreRegisterPage } from '../pages/pre-register/pre-register';
import { ShareContactPage } from '../pages/share-contact/share-contact';
import { PreAdvanceSearchPage } from '../pages/pre-advance-search/pre-advance-search';
import { PreRegisterDetailPage } from '../pages/pre-register-detail/pre-register-detail';
import { ProfilePage } from '../pages/profile/profile';
// import { AboutPage } from '../pages/about/about';
// import { ContactPage } from '../pages/contact/contact';

// import { TabsPage } from '../pages/tabs/tabs';
import { Storage } from '@ionic/storage';
import { StoreModule } from '@ngrx/store';
import { Ionic2RatingModule } from 'ionic2-rating';

// import { HeroActions } from '../actions/hero.actions';
// import { HeroReducer } from '../reducers/hero.reducer';
import { ImporterActions } from '../actions/importer.actions';
import { ImporterReducer } from '../reducers/importer.reducer';
import { UserActions } from '../actions/user.actions';
import { UserReducer } from '../reducers/user.reducer';
import { RouteActions } from '../actions/route.actions';
import { RouteReducer } from '../reducers/route.reducer';

import { AuthenticateService } from '../services/authenticate.service';
import { GlobalService } from '../services/global.service';
import { ImporterService } from '../services/importer.service';
import { SyncService } from '../services/sync.service';
import { AdvanceSearchService } from '../services/advance-search.service';

@NgModule({
  declarations: [
    MyApp,
    AuthenticatePage,
    HomePage,
    ImporterPage, 
    FirstStepPage,
    SecondStepPage,
    ThirdStepPage,
    ForthStepPage,
    FifthStepPage,
    CategoriesPage,
    SubcategoriesPage,
    GoogleMapPage ,
    ImporterListPage,
    ListViewPage , 
    GroupViewPage ,
    AdvanceSearchPage ,
    ImporterDetailPage ,
    FollowUpPage , 
    FollowUpDetailPage ,
    MyPortfolioPage ,
    PreRegisterPage ,
    ShareContactPage, 
    PreAdvanceSearchPage ,
    PreRegisterDetailPage ,
    ProfilePage
  ],
  imports: [
    ReactiveFormsModule   ,
    StoreModule.provideStore({
      importerState: ImporterReducer,
      userState: UserReducer,
      routeState: RouteReducer
    }),
    IonicModule.forRoot(MyApp),
    HttpModule,
    JsonpModule,
    Ionic2RatingModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AuthenticatePage,
    HomePage,
    ImporterPage,
    FirstStepPage,
    SecondStepPage,
    ThirdStepPage,
    ForthStepPage,
    FifthStepPage,
    CategoriesPage,
    SubcategoriesPage,
    GoogleMapPage ,
    ImporterListPage,
    ListViewPage ,
    GroupViewPage ,
    AdvanceSearchPage ,
    ImporterDetailPage ,
    FollowUpPage ,
    FollowUpDetailPage ,
    MyPortfolioPage ,
    PreRegisterPage ,
    ShareContactPage ,
    PreAdvanceSearchPage ,
    PreRegisterDetailPage ,
    ProfilePage
  ],
  providers: [
    {provide: ErrorHandler , useClass: IonicErrorHandler} ,
    ImporterActions ,
    UserActions , 
    AuthenticateService , 
    Storage , 
    GlobalService , 
    ImporterService , 
    RouteActions , 
    SyncService ,
    AdvanceSearchService
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AppModule {}
