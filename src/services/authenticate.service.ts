import { Injectable } from '@angular/core';
import { Http , Response , Headers , RequestOptions , Jsonp } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { API_LINK } from './config';

@Injectable()
export class AuthenticateService {
    constructor(
        private http: Http ,
        private jsonp : Jsonp
    ){}

    signIn (username: string , pass: string) : Observable<Response> {
        let bodyString = `use_username=${username}&use_password=${pass}` // Stringify payload
        let headers      = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); // ... Set content type to JSON
        let options       = new RequestOptions({ headers: headers });
        return this.http.post(API_LINK + `login_ditp.php` , bodyString , options)
    } 

    userProfile (sessionId: number) : Observable<Response> {
        let bodyString = `sessionID=${sessionId}` // Stringify payload
        let headers      = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }); // ... Set content type to JSON
        let options       = new RequestOptions({ headers: headers });
        return this.http.post(API_LINK + `user_profile.php` , bodyString , options)
    }
}  