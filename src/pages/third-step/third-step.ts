import { Component , OnInit , OnDestroy } from '@angular/core';
import { NavController  , Tabs , NavParams} from 'ionic-angular';
import { ImporterActions } from '../../actions/importer.actions';
import { ImporterService } from '../../services/importer.service';
import { GlobalService } from '../../services/global.service';
import { ProductCategories , UploadProduct } from '../../models/importer.model';
import { CategoriesPage } from '../categories/categories';
/*
  Generated class for the ThirdStep page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/

@Component({
  selector: 'page-third-step',
  templateUrl: 'third-step.html'
})
export class ThirdStepPage implements OnInit , OnDestroy{

  productCategories: Array<any>
  timer : any
  autoCompleteData: Array<ProductCategories>
  uploadProduct: Array<UploadProduct>
  uploadProductOld : Array<UploadProduct>
  alreadyAddCompany: boolean
  updateMode: boolean
  offlineMode: any
  keyForm: any

  constructor(
    public navCtrl: NavController ,
    private globalService: GlobalService,
    private importerService: ImporterService,
    private importerActions: ImporterActions,
    private tab: Tabs ,
    private _navParams: NavParams
  ) {
    this.productCategories = []
    this.timer = null
    this.autoCompleteData = []
    this.uploadProduct = []
    this.uploadProductOld = []
    this.updateMode = false

    if(typeof this._navParams.data !== 'undefined') {
      if(!this._navParams.data['offlineMode'] && (this._navParams.data['key_visit'] || this._navParams.data['force_update']))   this.updateMode = true
      else if(this._navParams.data['offlineMode']) {
        this.offlineMode = true
        this.keyForm = this._navParams.data['keyForm']
      }
    }
  }


  ngOnInit() {
    this.globalService.select('importerState').subscribe(res => {
        this.productCategories = res.importerData.productCategories
        this.uploadProductOld = this.uploadProduct
        this.uploadProduct = res.importerData.uploadProduct
        this.alreadyAddCompany = res.alreadyAddCompanyProfile
        if(this.uploadProduct.length !== this.uploadProductOld.length){
            // this.importerService.followUpProductCategory(this._navParams.data.com_id , this._navParams.data.key_visit , this.uploadProduct[this.uploadProduct.length-1])
            // .then((responseJson: any) => {
            //   if(responseJson.data[0]['chk_status'] == 'Y') {
            //     this.uploadProduct[this.uploadProduct.length-1].compi_id = responseJson.data[0].compi_id
            //     this.uploadProduct[this.uploadProduct.length-1].compi_image_name = responseJson.data[0].compi_image_name
            //   }
            //   //console.log(responseJson.data[0])
            // })
            if(this.offlineMode) {
              this.globalService.getFromStorageAsync('@importer:offline')
              .then(
                (res:Array<any>) => {
                  let newData = {
                    keyForm: this.keyForm ,
                    uploadProduct: this.uploadProduct
                  }
                  let index = 0 
                  if(this._navParams.data.hasOwnProperty('index_id')) index = this._navParams.data['index_id']
                  else index = res.findIndex(item => item.keyForm == this.keyForm) 
                  let newRes = res[index]
                  newRes = Object.assign({} , newRes , newData)
                  res[index] = newRes
                  this.globalService.setToStorage('@importer:offline' , res)
                }
              )
            }else{
              this.importerService.insertNewProductCategory(this.uploadProduct[this.uploadProduct.length-1])
            } 
        }
      })
      // test
      // setInterval(()=>{
      //   this.globalService.dispatch(this.importerActions.setUploadProduct('assets/images/test1.jpg' , 'test'))
      // },3000)
  }

  onKeyUp(e) {
    clearTimeout(this.timer)
    this.timer = setTimeout(()=> this.onSearch(e) , 1000)
  }

  onKeyDown() {
    clearTimeout(this.timer)
  }

  onSearch(e) {
      this.autoCompleteData = []
      this.importerService.getAutoData(e.srcElement.value).subscribe( res => {
        var resJson = res.json()
        if(resJson.data.chk_status == 'Y') {
          this.autoCompleteData = resJson.data.items
        }
      })
  }

  selectImageProduct() {
    this.globalService.imageActionSheet('upload_product')
  }

  setProductFromAutocomplete(product: ProductCategories) {
    this.autoCompleteData = []
    this.setProductText(product)
  }

  setProductText(product: ProductCategories) {
    if(this.updateMode) {
      this.productCategories.push(product)
      this.globalService.dispatch(this.importerActions.setProductCategories(this.productCategories))
      .then(()=>{
        this.importerService.followUpProductAdd(
          this._navParams.data.com_id , 
          this._navParams.data.key_visit ,
          product.pro_id
        )
      })
    }else if(this.offlineMode) {
      this.productCategories.push(product)
      this.globalService.getFromStorageAsync('@importer:offline')
      .then(
        (res:Array<any>) => {
          let newData = {
            keyForm: this.keyForm ,
            selectedProduct: this.productCategories
          }
          let index = 0 
          if(this._navParams.data.hasOwnProperty('index_id')) index = this._navParams.data['index_id']
          else index = res.findIndex(item => item.keyForm == this.keyForm)
          let newRes = res[index]
          newRes = Object.assign({} , newRes , newData)
          res[index] = newRes
          this.globalService.setToStorage('@importer:offline' , res)
        }
      )
    }
    else{
      if(this.alreadyAddCompany) {
        this.productCategories.push(product)
        this.globalService.dispatch(this.importerActions.setProductCategories(this.productCategories))
        .then(()=>{
          this.importerService.insertProductCategory(product)
        })
      }else{
        this.globalService.basicAlert('Error','Please add company profile.')
        this.tab.select(0)
      }
    }
  }

  gotoSearchCategory () {
    if(this.updateMode || this.offlineMode) {
        this.navCtrl.push(CategoriesPage , {params: this._navParams.data})
        this.globalService.setCurrentRoute('categories')
    }
    else{
      if(this.alreadyAddCompany){
        this.navCtrl.push(CategoriesPage)
        this.globalService.setCurrentRoute('categories')
      }else{
        this.globalService.basicAlert('Error','Please add company profile.')
        this.tab.select(0)
      }
    }
  }

  delete(pro_id){
    if(this.updateMode) {
      this.productCategories = this.productCategories.filter( item => item.pro_id !== pro_id)
      this.globalService.dispatch(this.importerActions.setProductCategories(this.productCategories))
      .then(()=>{
        this.importerService.removeProductCategory({pro_id: pro_id})
      })
    }else{
      this.productCategories = this.productCategories.filter( item => item.pro_id !== pro_id)
      this.globalService.dispatch(this.importerActions.setProductCategories(this.productCategories))
      .then(()=>{
        this.importerService.removeProductCategory({pro_id: pro_id})
      })
    }
  }

  deleteImage(product){
    // console.log(this.uploadProduct)
    console.log(this._navParams)
    console.log(product)
    if(this.updateMode) {
      this.globalService.confirmAlert('Warning' , '(1)Are you confirm to delete this product cate ? ')
      .then(
        res => {
          if(res) {
            this.uploadProduct = this.uploadProduct.filter( item => item.compi_id !== product.compi_id)
            this.importerService.deleteProductCate(this._navParams.data['com_id'] , product.compi_id ) 
            .subscribe(
              res => {
                // var resJson = res.json()
                // console.log(resJson)
              }
            )
          }
        }
      )
    }else if(this.offlineMode) {
      this.globalService.confirmAlert('Warning' , '(2)Are you confirm to delete this product cate ? ')
      .then(
        res => {
          if(res) {
            this.uploadProduct = this.uploadProduct.filter( item => item.compi_image_name !== product.compi_image_name)
            this.globalService.getFromStorageAsync('@importer:offline')
            .then(
              (res:Array<any>) => {
                let newData = {
                  keyForm: this.keyForm ,
                  uploadProduct: this.uploadProduct
                }
                let index = 0 
                if(this._navParams.data.hasOwnProperty('index_id')) index = this._navParams.data['index_id']
                else index = res.findIndex(item => item.keyForm == this.keyForm) 
                let newRes = res[index]
                newRes = Object.assign({} , newRes , newData)
                res[index] = newRes
                this.globalService.setToStorage('@importer:offline' , res)
              }
            )
          }
        }
      )
    }else{
      this.globalService.confirmAlert('Warning' , '(3)Are you confirm to delete this product cate ? ')
      .then(
        res => {
          if(res) {
            this.uploadProduct = this.uploadProduct.filter( item => item.compi_id !== product.compi_id)
            this.importerService.deleteProductCate(this._navParams.data['com_id'] , product.compi_id ) 
            .subscribe(
              res => {
                
              }
            )
          }
        }
      )
    }

  } 

  ngOnDestroy(){
    this.productCategories = []
    this.timer = null
    this.autoCompleteData = []
    this.uploadProduct = []
    this.uploadProductOld = []
  }

  gotoForthStep() {
    this.tab.select(3)
  }
}
