import { Injectable , NgZone } from '@angular/core'
import { GlobalService } from './global.service'
import { AdvanceSearchService } from './advance-search.service';
import { ImporterService } from './importer.service'

@Injectable()
export class SyncService {

    syncQueue : Array<number>
    timer: any
    loadSuccess: number 
    constructor(
        private globalService : GlobalService,
        private importerService : ImporterService,
        private _ngzone: NgZone ,
        private _as: AdvanceSearchService,
    ){
        this.syncQueue = []
        this.timer = null
        this.loadSuccess = 0
    }

    loadSubCategory(cat_id) {
        this.importerService.getSubProductCategory(cat_id).subscribe( subCat => {
            var resJson = subCat.json()
            var main_id = resJson.data[0].Main_id
            for(let item of resJson.data[0].subItems){
                if(item.count_sub_items > 0){
                    this.loadSubCategory(item.pro_id)
                }
            }
            this.globalService.setToStorage('@product_category:id:' + main_id , subCat.json().data)
        })
    }

    loadCategories(categories) {
        this.importerService.getSubProductCategories(categories).subscribe( res => {
            var resJson = res.json()
            if(resJson){
                for(let r of resJson.data) {
                    var arr = []
                    arr.push(r)
                    this.globalService.setToStorage('@product_category:id:' + r.Main_id , arr)
                    .then(()=>{
                        this.syncQueue.pop()
                        var sc = []
                        for(let s of r.subItems) {
                            if(s.count_sub_items > 0) {
                                this.syncQueue.push(s.pro_id)
                                sc.push(s.pro_id)
                            }
                        }
                        if(sc.length > 0) this.loadCategories(sc)
                    })
                }
            }
        })
    }

    afterMainCat() {
        this.globalService.getFromStorage('@product_category:list')
        .subscribe( categories => {
                var categoriyIDs = []
                for(let category of categories){
                 
                        // // find from main cat
                        // this.importerService.getSubProductCategory(category.pro_id).subscribe( subCat => {
                 
                        //         // find from sub
                        //         var resJson = subCat.json()
                        //         var main_id = resJson.data[0].Main_id
                        //         for(let item of resJson.data[0].subItems){
                        //             if(item.count_sub_items > 0){
                        //                 this.loadSubCategory(item.pro_id)
                        //             }
                        //         }
                        //         this.globalService.setToStorage('@product_category:id:' + main_id , subCat.json().data)
                          
                 
                        // })
                    this.syncQueue.push(category.pro_id)
                    categoriyIDs.push(category.pro_id)
                }
                this.loadCategories(categoriyIDs)

                this.timer = setInterval(()=>{
                if(this.syncQueue.length == 0 && this.loadSuccess == 6) {
                        this.globalService.loaded()
                        this.globalService.setToStorage('@sync:done' , true)
                        clearInterval(this.timer)
                    }else{
                        // console.log('still load')
                    }
                } , 500 )
        
        })
    }

    syncAllDataFromWebservice() {

        

        try {
            // country 
            this.importerService.getCountryList().subscribe( res => {
                
                    this.globalService.setToStorage('@country:list' , res.json().data)
                
            })
            // business type
            this.importerService.getBusinessTypeList().subscribe( res => {
                
                    this.globalService.setToStorage('@business:list' , res.json().data)
                
            })

            // for advance search 
            this._as.getList('sourcedata')
            .subscribe(
                res => {
                var resJson = res.json()
                this.globalService.setToStorage('@advance:sourceData' , resJson.data)
                this.loadSuccess++
                }
            )
            this._as.getList('office')
            .subscribe(
                res => {
                var resJson = res.json()
                this.globalService.setToStorage('@advance:office' , resJson.data)
                this.loadSuccess++
                }
            )
            this._as.getList('country')
            .subscribe(
                res => {
                var resJson = res.json()
                this.globalService.setToStorage('@advance:country' , resJson.data)
                this.loadSuccess++
                }
            )
            this._as.getList('businesstype')
            .subscribe(
                res => {
                var resJson = res.json()
                this.globalService.setToStorage('@advance:businessType' , resJson.data)
                this.loadSuccess++
                }
            )
            this._as.getList('company')
            .subscribe(
                res => {
                    var resJson = res.json()
                    this.globalService.setToStorage('@advance:company' , resJson.data)
                    this.loadSuccess++
                }
            )
            this._as.getList('contactperson')
            .subscribe(
                res => {
                    var resJson = res.json()
                    this.globalService.setToStorage('@advance:contactPerson' , resJson.data)
                    this.loadSuccess++
                }
            )

            // categories 
            this.importerService.getProductCategories().subscribe( res => {
            
                    this.globalService.setToStorage('@product_category:list' , res.json().data)
                    .then(()=>{
                        this.afterMainCat()
                    })
                    // sub categories
            })
            
            // prefixs
            this.importerService.getPrefixs().subscribe( res => {
                
                    var resJson = res.json()
                    this.globalService.setToStorage('@prefix:list' , resJson.data)
                
            })



            
            

        }catch(err) {
            this.globalService.setToStorage('@sync:done' , false)
        }
    }
}