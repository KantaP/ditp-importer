import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';

import { Processing , Company , PersonContact , NoteNeed , NoteNeedImage , AdvanceSearch } from '../models/importer.model';


@Injectable()
export class ImporterActions {
    static SET_CURRENT_STEP = 'SET_CURRENT_STEP';
    setCurrentStep(processing:Processing): Action {
        return {
            type: ImporterActions.SET_CURRENT_STEP,
            payload: processing
        }
    }

    static SHOW_CATEGORIES = 'SHOW_CATEGORIES';
    showCategories(): Action {
        return {
            type: ImporterActions.SHOW_CATEGORIES,
            payload: true
        }
    }

    static HIDE_CATEGORIES = 'HIDE_CATEGORIES';
    hideCategories(): Action {
        return {
            type: ImporterActions.HIDE_CATEGORIES,
            payload: false
        }
    }

    static SELECT_MAIN_CATEGORY = 'SELECT_MAIN_CATEGORY';
    selectCategory(cat_id: number) : Action {
        return {
            type: ImporterActions.SELECT_MAIN_CATEGORY,
            payload: cat_id
        }
    }

    static SET_COMPANY_IMAGE = 'SET_COMPANY_IMAGE';
    setCompanyImage(image: string) : Action {
        return {
            type: ImporterActions.SET_COMPANY_IMAGE,
            payload: image
        }
    }

    static SET_COMPANY_DATA_WITH_KEY = 'SET_COMPANY_DATA_WITH_KEY';
    setCompanyDataWithKey(key: string , val: any) : Action {
        return {
            type: ImporterActions.SET_COMPANY_DATA_WITH_KEY,
            payload: { 
                key,
                val
            }
        }
    }

    static SET_COMPANY_ALL_DATA = 'SET_COMPANY_ALL_DATA';
    setCompanyDataAll(companyData: Company) : Action{
        return {
            type: ImporterActions.SET_COMPANY_ALL_DATA,
            payload: companyData
        } 
    }

    static SET_BUSINESS_TYPE = 'SET_BUSINESS_TYPE';
    setBusinessType(businessTypes) : Action {
        return {
            type: ImporterActions.SET_BUSINESS_TYPE,
            payload: businessTypes
        }
    }

    static SET_PRODUCT_CATEGORIES = 'SET_PRODUCT_CATEGORIES';
    setProductCategories(productCategories) : Action {
        return {
            type: ImporterActions.SET_PRODUCT_CATEGORIES,
            payload: productCategories
        }
    }

    static SET_UPLOAD_PRODUCT = 'SET_UPLOAD_PRODUCT';
    setUploadProduct(imgUrl , desc)  : Action {
        return {
            type: ImporterActions.SET_UPLOAD_PRODUCT ,
            payload: {
                imgData: imgUrl,
                desc: desc
            }
        }
    }

    

    static ADD_COMPANY_PROFILE_SUCCESS = 'ADD_COMPANY_PROFILE_SUCCESS';
    addCompanySuccess() : Action {
        return {
            type: ImporterActions.ADD_COMPANY_PROFILE_SUCCESS
        }
    }

    static SET_CONTACT_PERSON_WITH_KEY = 'SET_CONTACT_PERSON_WITH_KEY';
    setContactPersonWithKey(key: string , val: any) : Action {
        return {
            type: ImporterActions.SET_CONTACT_PERSON_WITH_KEY,
            payload: {
                key,
                val
            }
        }
    }

    static SET_CONTACT_PERSON_ALL = 'SET_CONTACT_PERSON_ALL';
    setContactPersonAll(contactPerson: PersonContact) : Action {
        return {
            type: ImporterActions.SET_CONTACT_PERSON_ALL,
            payload: contactPerson
        }
    }

    static SET_NOTE_NEED_ALL = 'SET_NOTE_NEED_ALL';
    setNoteNeedAll(noteNeed:NoteNeed ) : Action {
        return {
            type: ImporterActions.SET_NOTE_NEED_ALL,
            payload: noteNeed
        }
    }

    static SET_NOTE_NEED_IMAGE = 'SET_NOTE_NEED_IMAGE';
    setNoteNeedImage(noteNeedImage: NoteNeedImage) : Action {
        return {
            type: ImporterActions.SET_NOTE_NEED_IMAGE,
            payload: noteNeedImage
        }
    }

    static SET_NOTE_NEED_IMAGE_ALL = 'SET_NOTE_NEED_IMAGE_ALL';
    setNoteNeedImageAll(noteNeedImages: Array<NoteNeedImage>) : Action {
        return {
            type: ImporterActions.SET_NOTE_NEED_IMAGE_ALL,
            payload: noteNeedImages
        }
    }

    static RESET_STATE = 'RESET_STATE';
    resetState() : Action {
        return {
            type: ImporterActions.RESET_STATE
        }
    }

    static SET_ADVANCE_SEARCH = 'SET_ADVANCE_SEARCH'
    setAdvanceSearch(advanceSearchValue: AdvanceSearch) : Action {
        return {
            type: ImporterActions.SET_ADVANCE_SEARCH,
            payload: advanceSearchValue
        }
    }

    static SET_PRODUCT_IMAGE_ALL = 'SET_PRODUCT_IMAGE_ALL'
    setProductImageAll(proImg: Array<any>) : Action {
        return {
            type: ImporterActions.SET_PRODUCT_IMAGE_ALL,
            payload: proImg
        }
    }

    static CLEAR_ALL_DATA = 'CLEAR_ALL_DATA'
    clearAllData() :Action {
        return {
            type: ImporterActions.CLEAR_ALL_DATA
        }
    }



} 