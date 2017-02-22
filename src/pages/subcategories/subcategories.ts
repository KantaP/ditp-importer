import { Component , OnInit , OnDestroy , NgZone} from '@angular/core';
import { NavController , NavParams } from 'ionic-angular';
import { GlobalService } from '../../services/global.service';
import { Category } from '../../models/importer.model';
import { Subscription } from 'rxjs/Subscription';
import { ImporterService } from '../../services/importer.service'; 
import { ImporterActions } from '../../actions/importer.actions';
/*
  Generated class for the Subcategories page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
interface Items {
  Category?: number;
  Main_id?:number;
  subItems?: Array<subItems>
}
interface subItems {
  count_sub_items?: number;
  parent_id?: number;
  pro_code?: number;
  pro_id?: number;
  pro_name?: string;
  pro_items?: Items;
}


@Component({
  selector: 'page-subcategories',
  templateUrl: 'subcategories.html'
})
export class SubcategoriesPage implements OnInit , OnDestroy{

  subScription:Subscription
  categories: Category
  mainCategoryName: string
  products: Array<Items>
  subProducts: Array<Items>
  selectedProduct: Array<any>

  timer: any
  onFire: any
  updateMode: boolean
  offlineMode: any
  keyForm: any

  constructor(
    public navCtrl: NavController,
    private globalService: GlobalService,
    private importerService: ImporterService,
    private _ngzone: NgZone,
    private importerActions: ImporterActions,
    private navParams: NavParams
  ){
    this.selectedProduct = []
    this.timer = null
    this.onFire = null
    this.updateMode = false
  }

  ngOnInit(){
    this.subScription = this.globalService.select('importerState').subscribe(res => {
      /*if(this.categories !== res.categories) {
        this.categories = res.categories  
      }*/
      this.selectedProduct = res.importerData.productCategories
    })

    this.categories = {
      main: this.navParams.get('category')
    }

    if(typeof this.navParams.get('params') !== 'undefined') {
      if(!this.navParams.get('params').offlineMode && (this.navParams.data['key_visit'] || this.navParams.data['force_update']))  this.updateMode = true
      else if(this.navParams.get('params').offlineMode) {
        this.offlineMode = true
        this.keyForm = this.navParams.get('params').keyForm
      }
    }
    // if(typeof this.navParams.get('params') !== 'undefined') this.updateMode = true
    

    this.timer = setInterval(()=>{
      if(this.onFire) {
        this.globalService.dispatch(this.importerActions.setProductCategories(this.selectedProduct))
        this.onFire = false
      }
    }, 100)

    setTimeout(()=>{this.loadSubCategories()},100)

  } 

  onSelected(pro_id){
    for(let s of this.selectedProduct){
      if(s.pro_id == pro_id) return true
    }
    return false
  }

  addSelected(input: any) {
    if(this.updateMode) {
      if(input.checked) {
        this.selectedProduct.push({ pro_id: input.value , pro_name: input.name})
        this.importerService.followUpProductAdd(
          this.navParams.get('params').com_id , 
          this.navParams.get('params').key_visit ,
          input.value
        )
      }
      else {
        this.selectedProduct = this.selectedProduct.filter( item => item.pro_id !== input.value)
        this.importerService.followUpProductDelete(
          this.navParams.get('params').com_id , 
          this.navParams.get('params').key_visit ,
          input.value
        )
      }
    }else if(this.offlineMode) {
      if(input.checked) {
        this.selectedProduct.push({ pro_id: input.value , pro_name: input.name})
      }
      else {
        this.selectedProduct = this.selectedProduct.filter( item => item.pro_id !== input.value)
      }
      this.globalService.getFromStorageAsync('@importer:offline')
      .then(
        (res:Array<any>) => {
          let newData = {
            keyForm: this.keyForm ,
            selectedProduct: this.selectedProduct
          }
          let index = res.findIndex(item => item.keyForm == this.keyForm) 
          let newRes = res[index]
          newRes = Object.assign({} , newRes , newData)
          res[index] = newRes
          this.globalService.setToStorage('@importer:offline' , res)
        }
      )
    }
    else{
      if(input.checked) {
        this.selectedProduct.push({ pro_id: input.value , pro_name: input.name})
        setTimeout(()=>{
          this.importerService.insertProductCategory({ pro_id: input.value , pro_name: input.name})
        },300)
      }
      else {
        this.selectedProduct = this.selectedProduct.filter( item => item.pro_id !== input.value)
        this.importerService.removeProductCategory({ pro_id: input.value , pro_name: input.name})
      }
    }
    
    this.onFire = true
  }

  loadSubCategories(productId?:number , checked?: any) {

    if(productId === null || typeof productId === 'undefined'){
        this.subScription = this.globalService.getFromStorage('@product_category:id:' + this.categories.main)
        .subscribe( res => {
          this.products = res
          this.mainCategoryName = res[0].Category
        })
    }else{ 

        if(!this.checkIfExistProItems(productId)) {
          this.globalService.getFromStorage('@product_category:id:'+productId).subscribe(res => {
            this.compareProductSelected(res[0])
          })
        }
    }
  }
 
  compareProductSelected (newSelectedProduct: Items) {
    for(let product of this.products[0].subItems) {
        if(product.pro_id == newSelectedProduct.Main_id) {
          product.pro_items = newSelectedProduct
          return true
        }
    }
    return false
  }

  checkIfExistProItems (productId: number) {
    for(let product of this.products[0].subItems) {
        if((product.pro_id == productId) && (product.pro_items !== null && typeof product.pro_items !== 'undefined') ) {
          product.pro_items = null
          return true
        }
    }
    return false
  }

  ngOnDestroy() {
    this.subScription.unsubscribe()
  }

  back(){
    this.navCtrl.pop()
    this.globalService.setCurrentRoute('categories')
  }

}
