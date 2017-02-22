import { Injectable } from '@angular/core';
import { Http , Headers , RequestOptions} from '@angular/http';
import { GlobalService } from './global.service';
import { API_LINK } from './config';

@Injectable() 
export class AdvanceSearchService {

    userData: any
    sessionID:number
    

    constructor(private _http : Http , private globalService: GlobalService) {
        this.globalService.select('userState').subscribe(res => {
            this.userData = res.data
            this.sessionID = this.userData.use_id
        })
    }

    getList(key:string , sessionID:number = this.userData.use_id || this.sessionID) {
        let bodyString = `sessionID=${sessionID}${'&'}from=${key}` // Stringify payload
        let headers  = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); // ... Set content type to JSON
        let options  = new RequestOptions({ headers: headers });
        return this._http.post(API_LINK + `get_list_data.php` , bodyString , options)
    }

    getListPreSearch(key: string , year: string = ""  ,sessionID:number = this.userData.use_id || this.sessionID){
        let bodyString = `sessionID=${sessionID}${'&'}field=${key}` // Stringify payload
        if(year != '') bodyString += `${'&'}year=${year}`
        let headers  = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); // ... Set content type to JSON
        let options  = new RequestOptions({ headers: headers });
        return this._http.post(API_LINK + `preregister_filter.php` , bodyString , options)
    }

    loadPreEvent(searchQuery:Object = {}, page:number = 1 , sessionID:number = this.userData.use_id || this.sessionID) {
        let bodyString = `sessionID=${sessionID}&search=yes`
        Object.keys(searchQuery).forEach((key , index)=>{
            bodyString += `&${key}=${searchQuery[key]}`
        })
        let headers  = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); // ... Set content type to JSON
        let options  = new RequestOptions({ headers: headers });
        return this._http.post(`http://112.121.150.4/ditp/ditp_webservice/preregister_advance_search.php?page=${page}` , bodyString , options)
    }

}