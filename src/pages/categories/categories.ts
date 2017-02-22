import { Component , OnInit , OnDestroy , NgZone } from '@angular/core';
import { NavController , NavParams} from 'ionic-angular';
import { ImporterService } from '../../services/importer.service';
import { ImporterActions } from '../../actions/importer.actions';
import { GlobalService } from '../../services/global.service';
import { Subscription } from 'rxjs/Subscription';
import { SubcategoriesPage } from '../subcategories/subcategories';

/*
  Generated class for the Categories page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-categories',
  templateUrl: 'categories.html'
})
export class CategoriesPage implements OnInit , OnDestroy{

  categories: any
  subScription: Subscription
  updateMode: boolean
  offlineMode: any
  keyForm:any

  constructor(
    public navCtrl: NavController ,
    private globalService: GlobalService,
    private importerService: ImporterService,
    private importerActions: ImporterActions,
    private _ngzone: NgZone,
    private _navParams: NavParams
  ) {
    this.updateMode = false
  }

  ngOnInit() {

    this.subScription = this.globalService.getFromStorage('@product_category:list')
    .subscribe(res => {
      if(res) {
        this.categories = res
      }//else{
      //   this._ngzone.run(()=>{
      //     setTimeout( () => {
      //       this.globalService.loading('Fetching...')
      //       this.subScription = this.importerService.getProductCategories().subscribe(res => {
      //         var resJson = res.json()
      //         this.categories = resJson.data
      //         this.globalService.setToStorage('@categories:main' , this.categories)
      //         this.globalService.loaded()  
      //       })} , 1000)
      //   })
      // }
    })
    
    if(typeof this._navParams.data !== 'undefined') {
      if(!this._navParams.data['offlineMode'])  this.updateMode = true
      else if(this._navParams.data['offlineMode']) {
        this.offlineMode = true
        this.keyForm = this._navParams.data['keyForm']
      }
    }
  }

  selectCategory(cat_id: number) {
    if(this.updateMode || this.offlineMode) {
      this.globalService.setCurrentRoute('subcategories')
      this.navCtrl.push(SubcategoriesPage , {category: cat_id , params : this._navParams.get('params')})
    }else{
      this.globalService.setCurrentRoute('subcategories')
      this.navCtrl.push(SubcategoriesPage , {category: cat_id})
    }
    
    //this.globalService.dispatch(this.importerActions.selectCategory(cat_id))
  }
  
  back(){
    this.globalService.setCurrentRoute('thirdStep')
    this.navCtrl.pop()
  }

  ngOnDestroy() {
    this.subScription.unsubscribe()
  }

}
