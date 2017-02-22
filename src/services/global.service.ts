import { AlertController , Platform } from 'ionic-angular';
import { NgZone } from '@angular/core';
import { Camera } from 'ionic-native';
import { LoadingController , ActionSheetController } from 'ionic-angular';
import { Injectable } from '@angular/core';

import { Store , Action } from '@ngrx/store';
import { AppState } from './app-state';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';

import { ImporterActions } from '../actions/importer.actions';
import { RouteActions } from '../actions/route.actions';

interface alertInput {
    type: string;
    label: string;
    value: string;
    checked: boolean;
}

@Injectable() 
export class GlobalService {

    loader: any;
    compi_desc: string
    
    constructor(
        private alertCtrl: AlertController,
        private store: Store<AppState>,
        private loadingCtrl: LoadingController,
        private storage: Storage,
        private sheetCtrl: ActionSheetController,
        private _ngzone: NgZone,
        private importerActions: ImporterActions,
        private routeActions: RouteActions,
        private _platform : Platform
    ){}

    basicAlert(title: string , message: string) {
        let alert = this.alertCtrl.create({
        title: title,
        subTitle: message,
            buttons: ['OK']
        });
        alert.present();
    }

    promiseBasicAlert(title: string , message: string) {
        return new Promise<any>((resolve,reject)=>{
            let alert = this.alertCtrl.create({
            title: title,
            subTitle: message,
                buttons: [
                    {
                        text: 'OK',
                        handler: () => {
                            resolve('ok')
                        }
                    }
                ]
            });
            alert.present();
        })
    }

    radioAlert(title: string , inputs: Array<alertInput>) {
        return new Promise<any>((resolve ,reject)=>{
            let alert = this.alertCtrl.create()
            alert.setTitle(title) 

            for(let input of inputs){
                alert.addInput(input)
            }

            alert.addButton('Cancel')
            alert.addButton({
                text: 'OK',
                handler: data => {
                    resolve(data)
                }
            });
            alert.present();
        })
    }

    checkboxAlert(title: string , inputs: Array<alertInput>) {
        return new Promise((resolve ,reject)=>{
            let alert = this.alertCtrl.create()
            alert.setTitle(title) 

            for(let input of inputs){
                alert.addInput(input)
            }

            alert.addButton('Cancel')
            alert.addButton({
                text: 'OK',
                handler: data => {
                    resolve(data)
                }
            });
            alert.present();
        })
    }

    confirmAlert(title: string , message: string) {
        return new Promise((resolve , reject) =>{
            let confirm = this.alertCtrl.create({
            title: title,
            message: message,
            buttons: [
                {
                    text: 'Cancel',
                    handler: () => {
                        resolve(false)
                    }
                },
                {
                    text: 'Confirm',
                    handler: () => {
                        resolve(true)
                    }
                }
            ]
            });
            confirm.present();
        })
    }

    promptAlert(title: string , message: string , inputs:Array<Object>){
        return new Promise((resolve , reject) => {
            let prompt = this.alertCtrl.create({
            title: title,
            message: message,
            inputs: inputs,
            buttons: [
                {
                    text: 'Cancel',
                    handler: data => {
                        resolve(null)
                    }
                },
                {
                    text: 'Save',
                    handler: data => {
                        resolve(data)
                    }
                }
            ]
            });
            prompt.present();
        })
    }

    dispatch(action: Action) {
        return new Promise((resolve , reject)=>{
            this.store.dispatch(action) 
            // console.log(action)
            resolve('patched')
        })    
    }

    select(key: string) : Observable<any> {
        return this.store.select(state => state[key])
    }

    loading(content: string) {
        this.loader = this.loadingCtrl.create({
            content: content
        })
        this.loader.present()
    }

    loaded() {
        if(this.loader !== null) {
            this.loader.dismiss()
        }
    }

    setToStorage(key:string , value: any){
        return this.storage.set(key , value)
    }

    getFromStorage(key:string) : Observable<any> {
        return Observable.create( (observer => {
            this.storage.get(key)
            .then( res => {
                observer.next(res)
                observer.complete()
            })
            .catch(err => {
                observer.next(null)
                observer.complete()
            })
        }))
    }

    getFromStorageAsync(key: string) : Promise<any> {
        return this.storage.get(key)
    }

    keysInStorage() {
        return this.storage.keys()
    }

    clearStorage() {
        this.storage.clear()
    }

    removeFromStorage(key:string) {
        this.storage.remove(key)
    } 

    imageActionSheet(saveTo: string) {
        var actionSheet = this.sheetCtrl.create({
            title: 'Select you image' ,
            buttons: [
                {
                    text:'Photo Galley',
                    role:'gallery',
                    handler: () => this.imageFromGallery(saveTo)
                },
                {
                    text:'Camera',
                    role:'camera',
                    handler: () => this.imageFromCamera(saveTo)
                },
                {
                    text:'Cancel',
                    role:'cancel',
                    handler: ()=> { }
                }
            ]
        })
        actionSheet.present()
    }

    imageFromCamera(saveTo: string) {
        this._platform.ready().then(() => {
            var options = {
                quality: 50,
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: 1,      // 0:Photo Library, 1=Camera, 2=Saved Photo Album
                encodingType: 0,     // 0=JPG 1=PNG 
                correctOrientatin: true,
                allowEdit: true,
            };
            Camera.getPicture(options).then((FILE_URI) => {
                var imgdata = FILE_URI
                if(saveTo.includes('com')){
                    this.dispatch(this.importerActions.setCompanyDataWithKey(saveTo,imgdata))
                }else if(saveTo.includes('product')) {
                    this.promptAlert('Input description' , 'Enter a description for this product' , [{name:'description',title:'Description'}])
                    .then(res => {
                        this.dispatch(this.importerActions.setUploadProduct(imgdata ,res['description']))
                    })
                }else if(saveTo == 'person_picture') {
                    this.dispatch(this.importerActions.setContactPersonWithKey('comc_picture' , imgdata))
                }else if(saveTo == 'person_front') {
                    this.dispatch(this.importerActions.setContactPersonWithKey('comc_namecard_front' , imgdata))
                }else if(saveTo == 'person_back') {
                    this.dispatch(this.importerActions.setContactPersonWithKey('comc_namecard_back' , imgdata))
                }else if(saveTo == 'note_need') {
                    this.dispatch(this.importerActions.setNoteNeedImage({comni_image_name: imgdata}))
                }
            }, (error) => {
                // alert(error);
            });
        })

        
    }


    
    

    imageFromGallery(saveTo: string){
        this._platform.ready().then(() => {
            var options = {
                quality: 50,
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: 0,      // 0:Photo Library, 1=Camera, 2=Saved Photo Album
                encodingType: 0,     // 0=JPG 1=PNG 
                correctOrientatin: true,
                allowEdit: true,
            };
            
            Camera.getPicture(options).then((FILE_URI) => {
                this._ngzone.run(()=>{
                    var imgdata = FILE_URI
                    if(saveTo.includes('com')){
                        this.dispatch(this.importerActions.setCompanyDataWithKey(saveTo,imgdata))
                    }else if(saveTo.includes('product')) {
                        this.promptAlert('Input description' , 'Enter a description for this product' , [{name:'description',title:'Description'}])
                        .then(res => {
                            this.dispatch(this.importerActions.setUploadProduct(imgdata ,res['description']))
                        })
                    }else if(saveTo == 'person_picture') {
                        this.dispatch(this.importerActions.setContactPersonWithKey('comc_picture' , imgdata))
                    }else if(saveTo == 'person_front') {
                        this.dispatch(this.importerActions.setContactPersonWithKey('comc_namecard_front' , imgdata))
                    }else if(saveTo == 'person_back') {
                        this.dispatch(this.importerActions.setContactPersonWithKey('comc_namecard_back' , imgdata))
                    }else if(saveTo == 'note_need') {
                        this.dispatch(this.importerActions.setNoteNeedImage({comni_image_name: imgdata}))
                    }
                })
            }, (error) => {
                // alert(error);
            });
        })
    }

    setCurrentRoute(route: string) {
        // console.log('current' , route)
        // this.loading('Go to '+route)
        this.dispatch(this.routeActions.setCurrentRoute(route)).then(()=>{
            // this.loaded()
        })
    }

    

}