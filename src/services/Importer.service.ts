import { Injectable , NgZone} from '@angular/core';
import { Http , Response , Headers , RequestOptions } from '@angular/http';
import { Platform } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { GlobalService } from './global.service';
import { User } from '../models/user.model';
import { Company , PersonContact , UploadProduct , NoteNeed , NoteNeedImage} from '../models/importer.model';
import { ImporterState } from '../reducers/importer.reducer';
import { ImporterActions } from '../actions/importer.actions';
import { API_LINK } from './config';
import { Transfer  } from 'ionic-native';

@Injectable() 
export class ImporterService {

    userData: User
    importerState: ImporterState
    CompanyProfile: Company
    contactPerson: PersonContact
    uploadProduct: UploadProduct
    noteNeed: NoteNeed
    noteNeedImages: Array<NoteNeedImage>

    sessionID:number


    constructor(
        private http: Http,
        private globalService: GlobalService,
        private _platform: Platform ,
        private _ngzone: NgZone,
        private importerActions : ImporterActions
    ){
        this.globalService.select('userState').subscribe(res => {
            this.userData = res.data
            this.sessionID = this.userData.use_id
        })
        this.globalService.select('importerState').subscribe(res => {
            this.importerState = res
            this.CompanyProfile = this.importerState.importerData.CompanyProfile
            this.contactPerson = this.importerState.importerData.contactPerson
            this.uploadProduct = this.importerState.importerData.uploadProduct
            this.noteNeed = this.importerState.importerData.noteNeed
            this.noteNeedImages = this.importerState.importerData.noteNeedImage
        }) 
        // this.userData.use_id = 10
        // this.sessionID = 10
    }

    checkPermissionFollowUp(com_id: number) : Promise<boolean>{
        return new Promise((resolve , reject) => {
            try{
                this.getCountryList()
                .subscribe(
                    res => {
                        var resJson = res.json()
                        var countrys = resJson.data
                        this.importerDetail(com_id)
                        .subscribe(
                            res2 => {
                                var resJson2 = res2.json()
                                var check = false
                                for(let cou of countrys) {
                                    if(resJson2.data.company_profile.cou_code == cou.cou_code) check = true
                                }
                                resolve(check)
                            }
                        )
                    }
                )
            }catch(err) {
                reject(err)
            }
        })
    }

    getQueryString(obj)
    {
        var result = "";

        for(let param in obj)
            result += ( encodeURIComponent(param) + '=' + encodeURIComponent(obj[param]) + '&' );

        if(result) //it's not empty string when at least one key/value pair was added. In such case we need to remove the last '&' char
            result = result.substr(0, result.length - 1); //If length is zero or negative, substr returns an empty string [ref. http://msdn.microsoft.com/en-us/library/0esxc5wy(v=VS.85).aspx]

        return result;
    }

    getCountryList() : Observable<Response> {
        let bodyString = `sessionID=${this.userData.use_id}` // Stringify payload
        let headers      = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
        let options       = new RequestOptions({ headers: headers });
        return this.http.post(API_LINK + `list_country.php` , bodyString , options)
    }

    getBusinessTypeList() : Observable<Response> {
        let bodyString = `sessionID=${this.userData.use_id}` // Stringify payload
        let headers      = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
        let options       = new RequestOptions({ headers: headers });
        return this.http.post(API_LINK + `list_type_of_business.php` , bodyString , options)
    }

    getProductCategories() : Observable<Response> {
        let bodyString = `sessionID=${this.userData.use_id}${'&'}action=main` // Stringify payload
        let headers      = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
        let options       = new RequestOptions({ headers: headers });
        return this.http.post(API_LINK + `list_of_product_category.php` , bodyString , options)
    }

    getSubProductCategories(productIDs: Array<number>) : Observable<Response> {
        let bodyString = `sessionID=${this.userData.use_id}${'&'}action=sub` // Stringify payload
        for(var i = 0; i < productIDs.length ; i++){
            bodyString += `${'&'}pro_id[]=${productIDs[i]}`
        }
        let headers      = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
        let options       = new RequestOptions({ headers: headers });
        return this.http.post(API_LINK + `list_of_product_category.php` , bodyString , options)
    }

    getSubProductCategory(productID: number) : Observable<Response> {
        let bodyString = `sessionID=${this.userData.use_id}${'&'}action=sub${'&'}pro_id[]=${productID}` // Stringify payload
        let headers      = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
        let options       = new RequestOptions({ headers: headers });
        return this.http.post(API_LINK + `list_of_product_category.php` , bodyString , options)
    }

    getPrefixs() : Observable<Response> {
        let bodyString = `sessionID=${this.userData.use_id}` // Stringify payload
        let headers      = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
        let options       = new RequestOptions({ headers: headers });
        return this.http.post(API_LINK + `list_prefix.php` , bodyString , options)
    }

    getAutoData(search:string) : Observable<Response> {
        let bodyString = `sessionID=${this.userData.use_id}${'&'}action=product${'&'}key=${search}` // Stringify payload
        let headers      = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
        let options       = new RequestOptions({ headers: headers });
        return this.http.post(API_LINK + `get_auto_data.php` , bodyString , options)
    }

    insertCompanyProfile() {

        this._platform.ready().then(()=> {
            if(this.CompanyProfile.com_logo !== '' && this.CompanyProfile.com_name_en !== '' 
            && this.CompanyProfile.com_address_en !== '' && this.CompanyProfile.cou_code > 0) {
                var url =  encodeURI(API_LINK + 'insert_importer.php');
                var fileTransfer = new Transfer()
                var options: any = {
                    fileKey: "com_logo",
                    fileName: this.CompanyProfile.com_logo.substr(this.CompanyProfile.com_logo.lastIndexOf('/') + 1),
                    httpMethod: "POST",
                    mimeType: "image/jpeg",
                    params: {
                        sessionID: this.userData.use_id ,
                        action: "saveupdate",
                        com_name_en: this.CompanyProfile.com_name_en,
                        com_address_en: this.CompanyProfile.com_address_en,
                        cou_code: this.CompanyProfile.cou_code,
                        com_street_en: this.CompanyProfile.com_street_en,
                        com_city_en: this.CompanyProfile.com_city_en,
                        com_state_en: this.CompanyProfile.com_state_en,
                        com_sub_state_en: this.CompanyProfile.com_sub_state_en,
                        com_zipcode_en: this.CompanyProfile.com_zipcode_en,
                        com_telephone: this.CompanyProfile.com_telephone ,
                        com_fax: this.CompanyProfile.com_fax,
                        com_website: this.CompanyProfile.com_website,
                        com_email: this.CompanyProfile.com_email,
                        com_lattitude: this.CompanyProfile.com_lattitude,
                        com_longitude: this.CompanyProfile.com_longitude
                    }, 
                    chunkedMode: false
                };
                // //console.log(options)
                fileTransfer.upload(this.CompanyProfile.com_logo , url ,options)
                .then(result => {
                    var responseJson:any = JSON.parse(result.response);
                    ////console.log(responseJson)

                    if(responseJson.data[0].chk_status == 'Y') {
                        this.globalService.getFromStorageAsync('@companyIds')
                        .then(res => {
                            ////console.log('companyId' , res )
                            if(res) { 
                                res = res.toString().split(',')
                                res.push(responseJson.data[0].com_id)
                                ////console.log('beforesave ' , res )
                                //@compnyIds should be Array
                                this.globalService.setToStorage('@companyIds' , res)
                            }else {
                                var companyIds = [responseJson.data[0].com_id]
                                this.globalService.setToStorage('@companyIds' , companyIds) 
                            }
                            // this.globalService.basicAlert('Test' , responseJson.data[0].com_id)
                            
                        })
                        if(this.CompanyProfile.com_factory_pic1 !== '') {
                            this.updateImageImporter(responseJson.data[0].com_id , "com_factory_pic1")
                        }
                        if(this.CompanyProfile.com_factory_pic2 !== '') {
                            this.updateImageImporter(responseJson.data[0].com_id , "com_factory_pic2")
                        }
                        if(this.CompanyProfile.com_factory_pic3 !== '') {
                            this.updateImageImporter(responseJson.data[0].com_id , "com_factory_pic3")
                        }
                        this.globalService.dispatch(this.importerActions.addCompanySuccess());
                    }else {
                        var message = '';
                        Object.keys(responseJson.data[0].error).forEach((key)=>{
                            message += responseJson.data[0].error[key][0]
                        })
                        this.globalService.basicAlert('Error' , message)
                    }
                    
                })
                .catch( error => {
                    // //console.log(JSON.stringify(error));
                }) 
            }
        }) 
    }

    promiseInsertCompanyProfile() {
        return new Promise((resolve, reject) =>{
            if(this.CompanyProfile.com_logo !== '' && this.CompanyProfile.com_name_en !== '' 
            && this.CompanyProfile.com_address_en !== '' && this.CompanyProfile.cou_code > 0) {
                var url =  encodeURI(API_LINK + 'insert_importer.php');
                var fileTransfer = new Transfer()
                var options: any = {
                    fileKey: "com_logo",
                    fileName: this.CompanyProfile.com_logo.substr(this.CompanyProfile.com_logo.lastIndexOf('/') + 1),
                    httpMethod: "POST",
                    mimeType: "image/jpeg",
                    params: {
                        sessionID: this.userData.use_id ,
                        action: "saveupdate",
                        com_name_en: this.CompanyProfile.com_name_en,
                        com_address_en: this.CompanyProfile.com_address_en,
                        cou_code: this.CompanyProfile.cou_code,
                        com_street_en: this.CompanyProfile.com_street_en,
                        com_city_en: this.CompanyProfile.com_city_en,
                        com_state_en: this.CompanyProfile.com_state_en,
                        com_sub_state_en: this.CompanyProfile.com_sub_state_en,
                        com_zipcode_en: this.CompanyProfile.com_zipcode_en,
                        com_telephone: this.CompanyProfile.com_telephone ,
                        com_fax: this.CompanyProfile.com_fax,
                        com_website: this.CompanyProfile.com_website,
                        com_email: this.CompanyProfile.com_email,
                        com_lattitude: this.CompanyProfile.com_lattitude,
                        com_longitude: this.CompanyProfile.com_longitude
                    }, 
                    chunkedMode: false
                };
                // //console.log(options)
                fileTransfer.upload(this.CompanyProfile.com_logo , url ,options)
                .then(result => {
                    var responseJson:any = JSON.parse(result.response);
                    ////console.log(responseJson)

                    if(responseJson.data[0].chk_status == 'Y') {
                        this.globalService.getFromStorageAsync('@companyIds')
                        .then(res => {
                            ////console.log('companyId' , res )
                            if(res) { 
                                res = res.toString().split(',')
                                res.push(responseJson.data[0].com_id)
                                ////console.log('beforesave ' , res )
                                //@compnyIds should be Array
                                this.globalService.setToStorage('@companyIds' , res)
                            }else {
                                var companyIds = [responseJson.data[0].com_id]
                                this.globalService.setToStorage('@companyIds' , companyIds) 
                            }
                            // this.globalService.basicAlert('Test' , responseJson.data[0].com_id)
                            
                        })
                        this.globalService.dispatch(this.importerActions.addCompanySuccess());
                        if(this.CompanyProfile.com_factory_pic1 !== '') {
                            this.updateImageImporter(responseJson.data[0].com_id , "com_factory_pic1")
                        }
                        if(this.CompanyProfile.com_factory_pic2 !== '') {
                            this.updateImageImporter(responseJson.data[0].com_id , "com_factory_pic2")
                        }
                        if(this.CompanyProfile.com_factory_pic3 !== '') {
                            this.updateImageImporter(responseJson.data[0].com_id , "com_factory_pic3")
                        }
                        resolve({com_id: responseJson.data[0].com_id})
                    }else {
                        var message = '';
                        Object.keys(responseJson.data[0].error).forEach((key)=>{
                            message += responseJson.data[0].error[key][0]
                        })
                        this.globalService.basicAlert('Error' , message)
                        resolve({error: message})
                    }
                    
                })
            }else{
                reject(new Error('Please input required field'))
            }
        })
        
    }

    updateImporter (com_id: number , keyVisit: string = "",params: Object , sessionID:number = this.userData.use_id || this.sessionID) {
        params['sessionID'] = sessionID
        params['action'] = 'saveupdate'
        params['com_id'] = com_id
        params['key_visit'] = keyVisit
        var bodyString = this.getQueryString(params)
        let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
        let options = new RequestOptions({ headers: headers });
        this.http.post(API_LINK + `update_importer.php` , bodyString , options)
        .subscribe( res => {
            if(!params['com_logo'].includes('http')){
                this.updateImageImporter(com_id , "com_logo")
            }
            if(!params['com_factory_pic1'].includes('http')){
                this.updateImageImporter(com_id, "com_factory_pic1")
            }
            if(!params['com_factory_pic2'].includes('http')){
                this.updateImageImporter(com_id , "com_factory_pic2")
            }
            if(!params['com_factory_pic3'].includes('http')){
                this.updateImageImporter(com_id , "com_factory_pic3")
            }
        })
    }  

    updateImageImporter (com_id:number , key: string) {
        var url =  encodeURI(API_LINK + 'update_importer.php');
        var fileTransfer = new Transfer()
        var options: any = {
            fileKey: key,
            fileName: this.CompanyProfile[key].substr(this.CompanyProfile[key].lastIndexOf('/') + 1),
            httpMethod: "POST",
            mimeType: "image/jpeg",
            params: {
                sessionID: this.userData.use_id || this.sessionID  ,
                action: "saveupdate",
                com_name_en: this.CompanyProfile.com_name_en,
                com_address_en: this.CompanyProfile.com_address_en,
                cou_code: this.CompanyProfile.cou_code,
                com_street_en: this.CompanyProfile.com_street_en,
                com_city_en: this.CompanyProfile.com_city_en,
                com_state_en: this.CompanyProfile.com_state_en,
                com_sub_state_en: this.CompanyProfile.com_sub_state_en,
                com_zipcode_en: this.CompanyProfile.com_zipcode_en,
                com_telephone: this.CompanyProfile.com_telephone ,
                com_fax: this.CompanyProfile.com_fax,
                com_website: this.CompanyProfile.com_website,
                com_email: this.CompanyProfile.com_email,
                com_lattitude: this.CompanyProfile.com_lattitude,
                com_longitude: this.CompanyProfile.com_longitude,
                com_id : com_id
            }, 
            chunkedMode: false
        };
        ////console.log(options)
        fileTransfer.upload(this.CompanyProfile[key] , url ,options)
        .then(result => {
            // var responseJson:any = JSON.parse(result.response);
            // console.log(responseJson)
            // //console.log(result.response)
        })
        .catch( error => {
            // //console.log(JSON.stringify(error));
        }) 
    }

    insertBusinessType () {
        if(this.importerState.alreadyAddCompanyProfile) {
            if(this.importerState.importerData.businessType.length > 0) {
                this.globalService.getFromStorageAsync('@companyIds')
                .then(res => {
                    if(res){
                        res = res.toString().split(',')
                        if(res.length > 0) {
                            for(let business of this.importerState.importerData.businessType){
                                let bodyString = `sessionID=${this.userData.use_id}${'&'}action=saveupdate${'&'}com_id=${res[res.length-1]}${'&'}bus_id=${business}`
                                //console.log(bodyString)
                                let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
                                let options = new RequestOptions({ headers: headers });
                                this.http.post(API_LINK + `insert_business_type.php` , bodyString , options)
                                .subscribe( res => {
                                    // var resJson = res.json()
                                    //console.log(resJson)
                                })
                            }
                        }else{
                            //this.globalService.basicAlert('Test' , 'Please add company .')
                        }
                    }
                })
                .catch( err => this.globalService.loaded())
            }else{
                //console.log('not select business')
            }
        }
    }

    insertBusinessTypeWithComId (com_id:number) {
        if(this.importerState.alreadyAddCompanyProfile) {
            if(this.importerState.importerData.businessType.length > 0) {
                for(let business of this.importerState.importerData.businessType){
                    let bodyString = `sessionID=${this.userData.use_id}${'&'}action=saveupdate${'&'}com_id=${com_id}${'&'}bus_id=${business}`
                    console.log(bodyString)
                    let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
                    let options = new RequestOptions({ headers: headers });
                    this.http.post(API_LINK + `insert_business_type.php` , bodyString , options)
                    .subscribe( res => {
                        var resJson = res.json()
                        console.log(resJson)
                    })
                }
            }else{
                console.log('not select business')
            }
        }else {
            console.log('not ready save company profile')
        }
    }

    updateBusinessType (com_id , key_visit , bus_id ,type) {
        let bodyString = `sessionID=${this.userData.use_id || this.sessionID}${'&'}action=saveupdate${'&'}com_id=${com_id}${'&'}bus_id=${bus_id}${'&'}type=${type}${'&'}key_visit=${key_visit}`
        //console.log(bodyString)
        let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
        let options = new RequestOptions({ headers: headers });
        this.http.post(API_LINK + `update_business_type.php` , bodyString , options)
        .subscribe( res => {
            // var resJson = res.json()
            //console.log(resJson)
        })
    }

    insertProductCategoryAll () {
        if(this.importerState.alreadyAddCompanyProfile) {
            if(this.importerState.importerData.productCategories.length > 0) {
                this.globalService.getFromStorageAsync('@companyIds')
                .then(res => {
                    if(res){
                        res = res.toString().split(',')
                        if(res.length > 0) {
                            for(let product of this.importerState.importerData.productCategories){
                                let bodyString = `sessionID=${this.userData.use_id}${'&'}action=saveupdate${'&'}com_id=${res[res.length-1]}${'&'}pro_id=${product.pro_id}`
                                //console.log(bodyString)
                                let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
                                let options = new RequestOptions({ headers: headers });
                                this.http.post(API_LINK + `insert_product_cate.php` , bodyString , options)
                                .subscribe( res => {
                                    // var resJson = res.json()
                                    //console.log(resJson)
                                })
                            }
                        }else{
                            //this.globalService.basicAlert('Test' , 'Please add company .')
                        }
                    }
                })
                .catch( err => this.globalService.loaded())
            }else{
                //console.log('not select product')
            }
        }
    }

    insertProductCategory(product:any) {
        if(this.importerState.alreadyAddCompanyProfile) {
            if(this.importerState.importerData.productCategories.length > 0) {
                this.globalService.getFromStorageAsync('@companyIds')
                .then(res => {
                    if(res){
                        res = res.toString().split(',')
                        if(res.length > 0) {
                            let bodyString = `sessionID=${this.userData.use_id}${'&'}action=saveupdate${'&'}com_id=${res[res.length-1]}${'&'}pro_id=${product.pro_id}`
                            //console.log(bodyString)
                            let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
                            let options = new RequestOptions({ headers: headers });
                            this.http.post(API_LINK + `insert_product_cate.php` , bodyString , options)
                            .subscribe( res => {
                                // var resJson = res.json()
                                //console.log(resJson)
                            })
                        }else{
                            //this.globalService.basicAlert('Test' , 'Please add company .')
                        }
                    }
                })
            }else{
                //console.log('not select product')
            }
        }
    }

    removeProductCategory(product:any) {
        if(this.importerState.alreadyAddCompanyProfile) {
            if(this.importerState.importerData.productCategories.length > 0) {
                this.globalService.getFromStorageAsync('@companyIds')
                .then(res => {
                    if(res){
                        res = res.toString().split(',')
                        if(res.length > 0) {
                            let bodyString = `sessionID=${this.userData.use_id}${'&'}action=product${'&'}com_id=${res[res.length-1]}${'&'}pro_id=${product.pro_id}`
                            //console.log(bodyString)
                            let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
                            let options = new RequestOptions({ headers: headers });
                            this.http.post(API_LINK + `delete_product_cate.php` , bodyString , options)
                            .subscribe( res => {
                                // var resJson = res.json()
                                //console.log(resJson)
                            })
                        }else{
                            //this.globalService.basicAlert('Test' , 'Please add company .')
                        }
                    }
                })
            }else{
                //console.log('not select product')
            }
        }
    }

    insertNewProductCategoryAll() {
        if(this.importerState.alreadyAddCompanyProfile) {
            if(this.importerState.importerData.uploadProduct.length > 0) {
                this.globalService.getFromStorageAsync('@companyIds')
                .then(res => {
                    if(res){
                        res = res.toString().split(',')
                        if(res.length > 0) {
                            var url =  encodeURI(API_LINK + 'insert_product_cate.php');
                            var fileTransfer = new Transfer()
                            var options: any
                            for(let up of this.importerState.importerData.uploadProduct){
                                options = {
                                    fileKey: "compi_image_name",
                                    fileName: up.compi_image_name.substr(up.compi_image_name.lastIndexOf('/') + 1),
                                    httpMethod: "POST",
                                    mimeType: "image/jpeg",
                                    params: {
                                        sessionID: this.userData.use_id , 
                                        action: "saveupdate" ,
                                        com_id: res[res.length-1],
                                        compi_desc: up.compi_desc
                                    }, 
                                    chunkedMode: false
                                };
                                fileTransfer.upload(up.compi_image_name , url ,options)
                                .then(result => {
                                    // var responseJson:any = JSON.parse(result.response);
                                    //console.log(responseJson.data[0])
                                })
                                .catch( err => this.globalService.loaded())
                            }
                        }else{
                            //this.globalService.basicAlert('Test' , 'Please add company .')
                        }
                    }
                })
            }
        }
    }

    followUpProductCategory(com_id:number, key_visit:string , uploadSrc: UploadProduct , compi_id:number = 0 ,sessionID:number = this.userData.use_id || this.sessionID) : Promise<Object>{
        return new Promise((resolve , reject) => {
            var url =  encodeURI(API_LINK + 'update_product_cate.php');
            var fileTransfer = new Transfer()
            var options: any
            options = {
                fileKey: "compi_image_name",
                fileName: uploadSrc.compi_image_name.substr(uploadSrc.compi_image_name.lastIndexOf('/') + 1),
                httpMethod: "POST",
                mimeType: "image/jpeg",
                params: {
                    sessionID: sessionID , 
                    action: "saveupdate" ,
                    com_id: com_id,
                    compi_desc: uploadSrc.compi_desc,
                    key_visit:key_visit 
                }, 
                chunkedMode: false
            };
            if(compi_id > 0) options.params['compi_id'] = compi_id
            //console.log(options)
            fileTransfer.upload(uploadSrc.compi_image_name , url ,options)
            .then(result => {
                var responseJson:any = JSON.parse(result.response);
                resolve(responseJson)
            })
        })
    }

    followUpProductCategoryDelete(com_id: number , key_visit: string , compi_id: number , sessionID:number = this.userData.use_id || this.sessionID) {
        let bodyString = `sessionID=${sessionID}${'&'}action=productimage${'&'}com_id=${com_id}${'&'}compi_id=${compi_id}${'&'}key_visit=${key_visit}`
        //console.log(bodyString)
        let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
        let options = new RequestOptions({ headers: headers });
        return this.http.post(API_LINK + `delete_product_cate.php` , bodyString , options)
        // .subscribe( res => {
        //     // var resJson = res.json()
        //     //console.log(resJson)
        // })
    }

    deleteProductCate(com_id: number , compi_id: number ,sessionID:number = this.userData.use_id || this.sessionID) {
        let bodyString = `sessionID=${sessionID}${'&'}action=productimage${'&'}com_id=${com_id}${'&'}compi_id=${compi_id}`
        let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
        let options = new RequestOptions({ headers: headers });
        return this.http.post(API_LINK + `delete_product_cate.php` , bodyString , options)
    } 

    insertNewProductCategory(uploadSrc: UploadProduct) {
        if(this.importerState.alreadyAddCompanyProfile) {
            if(this.importerState.importerData.uploadProduct.length > 0) {
                this.globalService.getFromStorageAsync('@companyIds')
                .then(res => {
                    if(res){
                        res = res.toString().split(',')
                        if(res.length > 0) {
                            var url =  encodeURI(API_LINK + 'insert_product_cate.php');
                            var fileTransfer = new Transfer()
                            var options: any
                            options = {
                                fileKey: "compi_image_name",
                                fileName: uploadSrc.compi_image_name.substr(uploadSrc.compi_image_name.lastIndexOf('/') + 1),
                                httpMethod: "POST",
                                mimeType: "image/jpeg",
                                params: {
                                    sessionID: this.userData.use_id , 
                                    action: "saveupdate" ,
                                    com_id: res[res.length-1],
                                    compi_desc: uploadSrc.compi_desc
                                }, 
                                chunkedMode: false
                            };
                            //console.log(options)
                            fileTransfer.upload(uploadSrc.compi_image_name , url ,options)
                            .then(result => {
                                // var responseJson:any = JSON.parse(result.response);
                                //console.log(responseJson.data[0])
                            })
                            .catch( err => this.globalService.loaded())
                        }
                    }
                })
            }
        }
    }

    removeProductCategoryImage (compi_id:number) {
        // if(this.importerState.alreadyAddCompanyProfile) {
        //     if(this.importerState.importerData.productCategories.length > 0) {
        //         this.globalService.getFromStorageAsync('@companyIds')
        //         .then(res => {
        //             if(res){
        //                 if(res.length > 0) {
        //                     let bodyString = `sessionID=${this.userData.use_id}${'&'}action=saveupdate${'&'}com_id=${res[res.length-1]}${'&'}pro_id=${product.pro_id}`
        //                     //console.log(bodyString)
        //                     let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
        //                     let options = new RequestOptions({ headers: headers });
        //                     this.http.post(API_LINK + `insert_product_cate.php` , bodyString , options)
        //                     .subscribe( res => {
        //                         var resJson = res.json()
        //                         //console.log(resJson)
        //                     })
        //                 }else{
        //                     //this.globalService.basicAlert('Test' , 'Please add company .')
        //                 }
        //             }
        //         })
        //     }else{
        //         //console.log('not select product')
        //     }
        // }
    }

    followUpProductAdd(com_id:number , key_visit:string  , pro_id:number , sessionID:number = this.userData.use_id || this.sessionID) {
        let bodyString = `sessionID=${sessionID}${'&'}action=saveupdate${'&'}com_id=${com_id}${'&'}pro_id=${pro_id}${'&'}key_visit=${key_visit}`
        //console.log(bodyString)
        let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
        let options = new RequestOptions({ headers: headers });
        this.http.post(API_LINK + `update_product_cate.php` , bodyString , options)
        .subscribe( res => {
            // var resJson = res.json()
            //console.log(resJson)
        })
    }

    followUpProductDelete(com_id:number , key_visit:string  , pro_id:number , sessionID:number = this.userData.use_id || this.sessionID) {
        let bodyString = `sessionID=${sessionID}${'&'}action=product${'&'}com_id=${com_id}${'&'}pro_id=${pro_id}${'&'}key_visit=${key_visit}`
        //console.log(bodyString)
        let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
        let options = new RequestOptions({ headers: headers });
        this.http.post(API_LINK + `delete_product_cate.php` , bodyString , options)
        .subscribe( res => {
            // var resJson = res.json()
            //console.log(resJson)
        })
    }

    insertContactPerson (){
        return Observable.create((observer) => {
            if(this.importerState.alreadyAddCompanyProfile) {   
            if(this.contactPerson.comc_firstname !== '' 
            && this.contactPerson.comc_lastname !== '' && this.contactPerson.pre_id > 0
            && this.contactPerson.comc_contact_number !== '' && this.contactPerson.comc_email !== '') {
                    this.globalService.getFromStorageAsync('@companyIds')
                    .then(res => {
                        if(res){
                            res = res.toString().split(',')
                            if(res.length > 0) {
                                var com_id = res[res.length - 1]
                                let bodyString = `sessionID=${this.userData.use_id}${'&'}action=saveupdate${'&'}com_id=${com_id}` // Stringify payload
                                if(this.contactPerson.comc_firstname) bodyString += `&comc_firstname=${this.contactPerson.comc_firstname}`
                                if(this.contactPerson.pre_id) bodyString += `&pre_id=${this.contactPerson.pre_id}`
                                if(this.contactPerson.comc_lastname) bodyString += `&comc_lastname=${this.contactPerson.comc_lastname}`
                                if(this.contactPerson.comc_middlename) bodyString += `&comc_middlename=${this.contactPerson.comc_middlename}`
                                if(this.contactPerson.comc_position) bodyString += `&comc_position=${this.contactPerson.comc_position}`
                                if(this.contactPerson.comc_contact_number) bodyString += `&comc_contact_number=${this.contactPerson.comc_contact_number}`
                                if(this.contactPerson.comc_email) bodyString += `&comc_email=${this.contactPerson.comc_email}`
                                let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
                                let options = new RequestOptions({ headers: headers });
                                this.http.post(API_LINK + `insert_contact_person.php` , bodyString , options)
                                .subscribe(
                                    (res)=>{
                                        var resJson = res.json()
                                        //console.log(resJson)
                                        //console.log(this.contactPerson)
                                        if(resJson.data[0].chk_status == 'Y') {
                                            var comc_id = resJson.data[0].comc_id
                                            if(this.contactPerson.comc_picture != '') {
                                                this.updateImageContactPerson(com_id , "comc_picture" , comc_id)
                                            }

                                            if(this.contactPerson.comc_namecard_front !== '') {
                                                this.updateImageContactPerson(com_id , "comc_namecard_front" , comc_id)
                                            }

                                            if(this.contactPerson.comc_namecard_back !== '') {
                                                this.updateImageContactPerson(com_id , "comc_namecard_back" , comc_id)
                                            }
                                        }
                                        observer.next(resJson)
                                        observer.complete()
                                    },
                                    err => {
                                        console.log(err)
                                    }
                                )
                            }
                        }else{
                            observer.next('')
                            observer.complete()
                        }
                    })
                    .catch( err => this.globalService.loaded())
                }else {
                    this.globalService.basicAlert('Contact Person' , 'Please input all text field')
                    observer.complete()
                }
            }else{
                // observer.next({data:[{msgs:'Please add company profile' , error: 1}]})
                observer.complete()
            }
        })
    }

    InsertContactFromFollowUp(com_id: number , params: Object , comc_id :number = 0 ) {
        params['sessionID'] = this.sessionID
        params['action'] = 'saveupdate'
        params['com_id'] = com_id
        if(comc_id > 0) params['comc_id'] = comc_id
        var bodyString = this.getQueryString(params)
        let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
        let options = new RequestOptions({ headers: headers });
        return this.http.post(API_LINK + `update_contact_person.php` , bodyString , options)
    }

    updateContact() {
        return Observable.create((observer)=>{
            if(this.importerState.alreadyAddCompanyProfile) {   
                if(this.contactPerson.comc_firstname !== '' 
                && this.contactPerson.comc_lastname !== '' && this.contactPerson.pre_id > 0
                && this.contactPerson.comc_contact_number !== '' && this.contactPerson.comc_email !== '') {
                    this.globalService.getFromStorageAsync('@companyIds')
                    .then(res => {
                        if(res) {
                            res = res.toString().split(',')
                            if(res.length > 0) {
                                var com_id = res[res.length - 1]
                                let bodyString = `sessionID=${this.userData.use_id}${'&'}action=saveupdate${'&'}com_id=${com_id}` // Stringify payload
                                Object.keys(this.contactPerson).forEach((key)=>{
                                    if(key !== "comc_picture" 
                                    && key !== "comc_namecard_front" 
                                    && key !== "comc_namecard_back" ) bodyString += `${'&'}${key}=${this.contactPerson[key]}`
                                })
                                let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
                                let options = new RequestOptions({ headers: headers });
                                //console.log(bodyString)
                                this.http.post(API_LINK + `update_contact_person.php` , bodyString , options)
                                .subscribe( res => {
                                    var resJson = res.json()
                                    if(resJson.data[0].chk_status == 'Y') {
                                        var comc_id = this.contactPerson.comc_id
                                        if(this.contactPerson.comc_picture != '') {
                                            this.updateImageContactPerson(com_id , "comc_picture" , comc_id)
                                        }

                                        if(this.contactPerson.comc_namecard_front !== '') {
                                            this.updateImageContactPerson(com_id , "comc_namecard_front" , comc_id)
                                        }

                                        if(this.contactPerson.comc_namecard_back !== '') {
                                            this.updateImageContactPerson(com_id , "comc_namecard_back" , comc_id)
                                        }
                                    }
                                    setTimeout(()=>this.globalService.dispatch(this.importerActions.setContactPersonAll({})),1500)
                                    observer.next(resJson)
                                    observer.complete()
                                })
                            }
                        }else{
                            observer.next('')
                            observer.complete()
                        }
                        
                    })
                    .catch( err => this.globalService.loaded())
                }else{
                    this.globalService.basicAlert('Contact Person' , 'Please input all text field')
                }
            }else{
                // observer.next({msgs:'Please add company profile' , error: 1})
                observer.complete()
            }
        })
    }

    updateImageContactPerson (com_id:number , key: string , comc_id: number) {
        this._platform.ready().then(()=> {
            var url =  encodeURI(API_LINK + 'update_contact_person.php');
            var fileTransfer = new Transfer()
            var options = {
                fileKey: key,
                fileName: this.contactPerson[key].substr(this.contactPerson[key].lastIndexOf('/') + 1),
                httpMethod: "POST",
                mimeType: "image/jpeg",
                params: {
                    sessionID: this.userData.use_id , 
                    action: "saveupdate" ,
                    com_id: com_id,
                    pre_id: this.contactPerson.pre_id,
                    comc_firstname: this.contactPerson.comc_firstname,
                    comc_lastname: this.contactPerson.comc_lastname,
                    comc_middlename: this.contactPerson.comc_middlename,
                    comc_position: this.contactPerson.comc_position,
                    comc_contact_number: this.contactPerson.comc_contact_number,
                    comc_email: this.contactPerson.comc_email,
                    comc_id: comc_id
                }, 
                chunkedMode: false
            };
            fileTransfer.upload(this.contactPerson[key] , url ,options)
            .then(result => {
                // var responseJson:any = JSON.parse(result.response);
                // console.log(responseJson)
            })
            .catch( err => this.globalService.loaded())
        })
    }

    getListContact (search: string = '') {
        return Observable.create((observer)=>{
            if(this.importerState.alreadyAddCompanyProfile) {
                this.globalService.getFromStorageAsync('@companyIds')
                .then(res => {
                    if(res){
                        res = res.toString().split(',')
                        if(res.length > 0) {
                            let bodyString = `sessionID=${this.userData.use_id}${'&'}com_id=${res[res.length-1]}`
                            if(search !== '') {
                                bodyString += `${'&'}action=search${'&'}key=${search}`
                            }
                            let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
                            let options = new RequestOptions({ headers: headers });
                            //console.log(bodyString)
                            this.http.post(API_LINK + `list_contact.php` , bodyString , options)
                            .subscribe( 
                                res => {
                                    var resJson = res.json()
                                    //console.log(resJson)
                                    observer.next(resJson.data)
                                    observer.complete()
                                },
                                err => this.globalService.loaded()
                            )
                        }else{
                            //this.globalService.basicAlert('Test' , 'Please add company .')
                        }
                    }else{
                        observer.next('')
                        observer.complete()
                    }
                })
                .catch( err => this.globalService.loaded())
            }else{
                // observer.next({msgs:'Please add company profile' , error: 1})
                observer.complete()
            }
        })
    }

    getListContactFollowUp(com_id: number , search: string = '') {
        let bodyString = `sessionID=${this.userData.use_id || this.sessionID}${'&'}com_id=${com_id}`
        if(search !== '') {
            bodyString += `${'&'}action=search${'&'}key=${search}`
        }
        let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
        let options = new RequestOptions({ headers: headers });
        //console.log(bodyString)
        return this.http.post(API_LINK + `list_contact.php` , bodyString , options)
    } 

    deleteContact(comc_id: number) {
        return Observable.create((observer)=>{
            let bodyString = `sessionID=${this.userData.use_id}${'&'}action=delete${'&'}comc_id=${comc_id}`
            let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
            let options = new RequestOptions({ headers: headers });
            //console.log(bodyString)
            return this.http.post(API_LINK + `delete_contact.php` , bodyString , options)

        })
    }

    insertNoteNeed () {
        return Observable.create((observer)=>{
            if(this.importerState.alreadyAddCompanyProfile) {
                this.globalService.getFromStorageAsync('@companyIds')
                .then(res => {
                    if(res) {
                        res = res.toString().split(',')
                        if(res.length > 0) {
                            let bodyString = `sessionID=${this.userData.use_id}${'&'}action=saveupdate${'&'}comn_title=${this.noteNeed.comn_title}${'&'}comn_note=${this.noteNeed.comn_note}${'&'}com_id=${res[res.length-1]}`
                            let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
                            let options = new RequestOptions({ headers: headers });
                            //console.log(bodyString)
                            this.http.post(API_LINK + `insert_noteneed.php` , bodyString , options)
                            .subscribe( res => {
                                var resJson = res.json()
                                //console.log(resJson)
                                if(resJson.data[0].chk_status == 'Y') {
                                    if(this.insertNoteNeedImage.length > 0) {
                                         for(let noteImage of this.noteNeedImages) {
                                            this.insertNoteNeedImage(noteImage.comni_image_name , resJson.data[0].comn_id)
                                        }
                                    }
                                }
                                observer.next(resJson)
                                observer.complete()
                            })
                        }
                    }else{
                        observer.next('')
                        observer.complete()
                    }
                })
                .catch( err => this.globalService.loaded())
            }else{
                // observer.next({msgs:'Please add company profile' , error: 1})
                observer.complete()
            }
        })
    }

    insertNoteNeedImage (filename: string , comn_id: number) {
        this._platform.ready().then(()=> {
            var url =  encodeURI(API_LINK + 'insert_noteneed.php');
            var fileTransfer = new Transfer()
            var options = {
                fileKey: 'comni_image_name',
                fileName: filename.substr(filename.lastIndexOf('/') + 1),
                httpMethod: "POST",
                mimeType: "image/jpeg",
                params: {
                    sessionID: this.userData.use_id , 
                    action: "saveimage" ,
                    comn_id: comn_id,
                }, 
                chunkedMode: false
            };
            fileTransfer.upload(filename , url ,options)
            .then(result => {
                // var responseJson:any = JSON.parse(result.response);
                //console.log(responseJson)
            })
            .catch( err => this.globalService.loaded())
        })
    }
 
    ImporterList(sessionID:number = this.userData.use_id || this.sessionID , page: number = 1) {
        let bodyString = `sessionID=${sessionID}` // Stringify payload
        let headers    = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
        let options    = new RequestOptions({ headers: headers });
        return this.http.post(API_LINK + `list_importer_list.php?page=${page}` , bodyString , options)
    } 

    favoriteList(sessionID: number = 1 , page: number = 1) {
        let bodyString = `sessionID=${sessionID}` // Stringify payload
        let headers    = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
        let options    = new RequestOptions({ headers: headers });
        return this.http.post(API_LINK + `favorite_list.php?page=${page}` , bodyString , options)
    }

    favoriteInsert(favg_name: string , sessionID: number = 1 ) {
        let bodyString = `sessionID=${sessionID}${'&'}action=create${'&'}favg_name=${favg_name}` // Stringify payload
        let headers    = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
        let options    = new RequestOptions({ headers: headers });
        return this.http.post(API_LINK + `favorite_insert.php` , bodyString , options)
    }     

    importerSetFavorite(com_id: number , favgs: Array<number> , sessionID: number = 1 ){
        return new Promise((resolve , reject)=>{
            try{
                this.globalService.loading('Saving...')
                var count = favgs.length
                console.log(favgs)
                console.log(count)
                if(count > 0) {
                    for(let group of favgs) {
                        let bodyString = `sessionID=${sessionID}${'&'}action=set${'&'}com_id=${com_id}${'&'}favg_id=${group}` // Stringify payload
                        let headers    = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
                        let options    = new RequestOptions({ headers: headers });
                        this.setFavorite(options , bodyString)
                        .then(res =>{
                            count--
                            console.log(count)
                            if(count == 0) {
                                this.globalService.loaded()
                                resolve('done') 
                            }
                        })
                    }
                }else{
                    let bodyString = `sessionID=${sessionID}${'&'}action=unset${'&'}com_id=${com_id}` // Stringify payload
                    let headers    = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
                    let options    = new RequestOptions({ headers: headers });
                    this.setFavorite(options , bodyString)
                    .then(res =>{
                        this.globalService.loaded()
                        resolve('done') 
                    })
                }
                
            }catch(err) {
                reject(err) 
            }
        })
    }

    setFavorite(headers , body){
        return new Promise((resolve ,reject)=> {
            this.http.post(API_LINK + `favorite_update.php` , body , headers)
            .subscribe(
                res => {
                    resolve(res)
                },
                err => {
                    reject(err)
                }
            )
        })
    }

    deleteFavorite(favg_id: number , sessionID: number = this.userData.use_id || this.sessionID) {
        let bodyString = `sessionID=${sessionID}${'&'}action=group${'&'}favg_id=${favg_id}` // Stringify payload
        let headers    = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
        let options    = new RequestOptions({ headers: headers });
        return this.http.post(API_LINK + `favorite_delete.php` , bodyString , options)
    }

    updateFavorite(favg_id: number , favg_name:string , sessionID:number = this.userData.use_id || this.sessionID) {
        let bodyString = `sessionID=${sessionID}${'&'}action=update${'&'}favg_id=${favg_id}${'&'}favg_name=${favg_name}` // Stringify payload
        let headers    = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
        let options    = new RequestOptions({ headers: headers });
        return this.http.post(API_LINK + `favorite_insert.php` , bodyString , options)
    }

    searchImporter(key: string = "" , searchQuery: Object = {sorting: 'com_name_en ASC'} , page:number = 1 , myPort: boolean = false ,
    sessionID:number = this.userData.use_id || this.sessionID) {
        let bodyString = `sessionID=${sessionID}${'&'}search=yes` // Stringify payload
        if(key) bodyString += `${'&'}key=${key}`
        Object.keys(searchQuery).forEach((key)=>{
            if(searchQuery[key] !== '' && typeof searchQuery[key] !== 'undefined') bodyString += `${'&'}${key}=${searchQuery[key]}`
        })
        if(myPort) bodyString += `${'&'}action=portfolio`
        let headers    = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
        let options    = new RequestOptions({ headers: headers });
        return this.http.post(API_LINK + `list_importer_list.php?page=${page}` , bodyString , options)
    }

    searchFavorite(key: string = "" , sessionID:number = this.userData.use_id || this.sessionID) {
        let bodyString = `sessionID=${sessionID}${'&'}search=yes` // Stringify payload
        if(key) bodyString += `${'&'}key=${key}`
        let headers    = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
        let options    = new RequestOptions({ headers: headers });
        return this.http.post(API_LINK + `favorite_list.php` , bodyString , options)
    }

    importerDetail(com_id: number , sessionID:number = this.userData.use_id || this.sessionID) {
        let bodyString = `sessionID=${sessionID}${'&'}com_id=${com_id}` // Stringify payload
        let headers    = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
        let options    = new RequestOptions({ headers: headers });
        return this.http.post(API_LINK + `list_importer_detail.php` , bodyString , options)
    }

    findLocationByLatLng(lat:any , lng:any){
        return this.http.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyCFp_PA08fXXBwFD0SPRaQIUotIL8XLcW8`)
    }

    importerRankScore(com_id: number , sessionID:number = this.userData.use_id || this.sessionID){
        let bodyString = `sessionID=${sessionID}${'&'}com_id=${com_id}` // Stringify payload
        let headers    = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
        let options    = new RequestOptions({ headers: headers });
        return this.http.post(API_LINK + `list_importer_rankscore.php` , bodyString , options)
    }

    importerAddRankScore(com_id:number , rank:number , sessionID:number = this.userData.use_id || this.sessionID) {
        let bodyString = `sessionID=${sessionID}${'&'}com_id=${com_id}${'&'}action=save${'&'}comrh_rating=${rank}` // Stringify payload
        let headers    = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
        let options    = new RequestOptions({ headers: headers });
        return this.http.post(API_LINK + `list_importer_rankscore.php` , bodyString , options)
    }

    followUpSaveVisit(com_id: number , comn_title: string , comn_note: string , sessionID:number = this.userData.use_id || this.sessionID) {
        let bodyString = `sessionID=${sessionID}${'&'}com_id=${com_id}${'&'}action=saveupdate${'&'}comn_title=${comn_title}${'&'}comn_note=${comn_note}${'&'}visit=noupdate` // Stringify payload
        let headers    = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
        let options    = new RequestOptions({ headers: headers });
        return this.http.post(API_LINK + `followup_noteneed.php` , bodyString , options)
    }

    followUpGetKeyForSaveUpdate(com_id: number , sessionID:number = this.userData.use_id || this.sessionID){
        let bodyString = `sessionID=${sessionID}${'&'}com_id=${com_id}${'&'}action=saveupdate${'&'}visit=update` // Stringify payload
        let headers    = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
        let options    = new RequestOptions({ headers: headers });
        return this.http.post(API_LINK + `followup_noteneed.php` , bodyString , options)
    }

    importerHistory(com_id: number , sessionID:number = this.userData.use_id || this.sessionID) {
        let bodyString = `sessionID=${sessionID}${'&'}com_id=${com_id}` // Stringify payload
        let headers    = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
        let options    = new RequestOptions({ headers: headers });
        return this.http.post(API_LINK + `list_importer_history.php` , bodyString , options)
    }

    preRegisterList(key: string = "" , type: string = "" , eve_id:number = 0, eve_date_start:string = "" , eve_date_end: string = "" , 
                    page:number = 1 , sessionID:number = this.userData.use_id || this.sessionID) 
    {
        let bodyString = ``
        if(key) bodyString += `key=${key}&search=yes&`
        if(type) bodyString += `type=${type}&`
        if(eve_id) bodyString += `eve_id=${eve_id}&`
        if(eve_date_start) bodyString += `eve_date_start=${eve_date_start}&`
        if(eve_date_end) bodyString += `eve_date_end=${eve_date_end}&`
        bodyString += `sessionID=${sessionID}&page=${page}`
        let headers    = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
        let options    = new RequestOptions({ headers: headers });
        return this.http.post(API_LINK + `preregister_list.php` , bodyString , options)
    }

    shareContactSearch(key: string = "" , searchQuery: Object = {sorting: 'com_name_en ASC'} , page:number = 1 ,
    sessionID:number = this.userData.use_id || this.sessionID) {
        let bodyString = `sessionID=${sessionID}${'&'}search=yes&action=company` // Stringify payload
        if(key) bodyString += `${'&'}key=${key}`
        Object.keys(searchQuery).forEach((key)=>{
            if(searchQuery[key] !== '' && typeof searchQuery[key] !== 'undefined') bodyString += `${'&'}${key}=${searchQuery[key]}`
        })
        let headers    = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
        let options    = new RequestOptions({ headers: headers });
        return this.http.post(API_LINK + `share_contact_list.php?page=${page}` , bodyString , options)
    } 

    favoriteView(favg_id : number , sessionID: number = this.userData.use_id || this.sessionID) {
        let bodyString = `sessionID=${sessionID}${'&'}favg_id=${favg_id}` // Stringify payload
        let headers    = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
        let options    = new RequestOptions({ headers: headers });
        return this.http.post(API_LINK + `favorite_view.php` , bodyString , options)
    }

    langauageList(sessionID: number = this.userData.use_id || this.sessionID) {
        let bodyString = `sessionID=${sessionID}${'&'}action=list` // Stringify payload
        let headers    = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
        let options    = new RequestOptions({ headers: headers });
        return this.http.post(API_LINK + `setting_language.php` , bodyString , options)
    }

    langauageCurrent(sessionID: number = this.userData.use_id || this.sessionID) {
        let bodyString = `sessionID=${sessionID}${'&'}action=current` // Stringify payload
        let headers    = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
        let options    = new RequestOptions({ headers: headers });
        return this.http.post(API_LINK + `setting_language.php` , bodyString , options)
    }

    langauageSet(lan_id: number , sessionID: number = this.userData.use_id || this.sessionID) {
        let bodyString = `sessionID=${sessionID}${'&'}action=save${'&'}lan_id=${lan_id}` // Stringify payload
        let headers    = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
        let options    = new RequestOptions({ headers: headers });
        return this.http.post(API_LINK + `setting_language.php` , bodyString , options)
    }

    deleteImporter(com_id:number , sessionID: number = this.userData.use_id || this.sessionID) {
        let bodyString = `sessionID=${sessionID}${'&'}action=delete${'&'}com_id=${com_id}` // Stringify payload
        let headers    = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); 
        let options    = new RequestOptions({ headers: headers });
        return this.http.post(API_LINK + `delete_my_portfolio.php` , bodyString , options)
    }

}  
   