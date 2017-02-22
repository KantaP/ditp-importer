import { Action } from '@ngrx/store';
import { ImporterActions } from '../actions/importer.actions';
import { Processing , Category , Company , BusinessType , ProductCategories , 
    UploadProduct , PersonContact , NoteNeed , NoteNeedImage , AdvanceSearch} from '../models/importer.model';



interface ImporterData {
    CompanyProfile: Company;
    businessType: Array<BusinessType>;
    productCategories: Array<ProductCategories>;
    uploadProduct: Array<UploadProduct>;
    contactPerson:  PersonContact;
    noteNeed: NoteNeed,
    noteNeedImage: Array<NoteNeedImage>
}

export interface ImporterState {
    importerData: ImporterData;
    processing: Processing;
    showCategories: boolean;
    categories: Category;
    alreadyAddCompanyProfile: boolean,
    advanceSearch: AdvanceSearch
}

export const InitState: ImporterState = {
    importerData: {
        CompanyProfile: {},
        businessType: [],
        productCategories: [] ,
        uploadProduct: [] ,
        contactPerson: {},
        noteNeed: {},
        noteNeedImage: []
    },
    processing: {
        currentStep : 1
    },
    showCategories: false ,
    categories : {
        main: 0 ,
        sub: []
    },
    alreadyAddCompanyProfile: false,
    advanceSearch: {}
}

export function ImporterReducer (state = InitState , action: Action){
    switch(action.type){
        case ImporterActions.SET_CURRENT_STEP:
            return Object.assign(
                {},
                state,
                {
                    processing: action.payload
                }
            )
        case ImporterActions.SHOW_CATEGORIES :
        case ImporterActions.HIDE_CATEGORIES :
            return Object.assign(
                {},
                state,
                {
                    showCategories: action.payload
                }
            )
        case ImporterActions.SELECT_MAIN_CATEGORY :
            return Object.assign(
                {},
                state,
                {
                    categories: Object.assign(
                        {},
                        state.categories,
                        {
                            main: action.payload
                        }
                    )
                }
            )
        case ImporterActions.SET_COMPANY_IMAGE :
            return Object.assign(
                {},
                state,
                {
                    importerData: Object.assign(
                        {},
                        state.importerData,
                        {
                            CompanyProfile: Object.assign(
                                {},
                                state.importerData.CompanyProfile,
                                {
                                    com_logo: action.payload
                                }
                            )
                        }
                    )
                }
            )
        case ImporterActions.SET_COMPANY_DATA_WITH_KEY :
            return Object.assign(
                {},
                state,
                {
                    importerData: Object.assign(
                        {},
                        state.importerData,
                        {
                            CompanyProfile: Object.assign(
                                {},
                                state.importerData.CompanyProfile,
                                state.importerData.CompanyProfile[action.payload.key] = action.payload.val
                            )
                        }
                    )
                }
            )
        case ImporterActions.SET_BUSINESS_TYPE :
            return Object.assign(
                {},
                state,
                {
                    importerData: Object.assign(
                        {},
                        state.importerData,
                        {
                            businessType: action.payload
                        }
                    )
                }
            )
        case ImporterActions.SET_PRODUCT_CATEGORIES :
            return Object.assign(
                {},
                state,
                {
                    importerData: Object.assign(
                        {},
                        state.importerData,
                        {
                            productCategories: action.payload
                        }
                    )
                }
            )
        case ImporterActions.SET_UPLOAD_PRODUCT :
            return Object.assign(
                {},
                state,
                {
                    importerData: Object.assign(
                        {},
                        state.importerData,
                        {
                            uploadProduct: [
                                ...state.importerData.uploadProduct,
                                {
                                    compi_image_name: action.payload.imgData,
                                    compi_desc: action.payload.desc
                                }
                            ]
                        }
                    )
                }
            )
        case ImporterActions.SET_COMPANY_ALL_DATA : 
            return Object.assign(
                {},
                state ,
                {
                    importerData: Object.assign(
                        {} ,
                        state.importerData ,
                        {
                            CompanyProfile: action.payload
                        }
                    )
                }
            )
        case ImporterActions.ADD_COMPANY_PROFILE_SUCCESS :
            return Object.assign(
                {},
                state,
                {
                    alreadyAddCompanyProfile : true
                }
            )
        case ImporterActions.SET_CONTACT_PERSON_WITH_KEY : 
            var newState = {}
            newState[action.payload.key] = action.payload.val
            return Object.assign(
                {},
                state,
                {
                    importerData: Object.assign(
                        {},
                        state.importerData,
                        {
                            contactPerson: Object.assign(
                                {},
                                state.importerData.contactPerson,
                                newState
                            )
                        }
                    )
                }
            )
        case ImporterActions.SET_CONTACT_PERSON_ALL : 
            return Object.assign(
                {},
                state,
                {
                    importerData: Object.assign(
                        {},
                        state.importerData,
                        {
                            contactPerson: action.payload
                        }
                    )
                }
            )
        case ImporterActions.SET_NOTE_NEED_ALL :
            return Object.assign(
                {},
                state,
                {
                    importerData: Object.assign(
                        {},
                        state.importerData,
                        {
                            noteNeed: action.payload
                        }
                    )
                }
            ) 
        case ImporterActions.SET_NOTE_NEED_IMAGE :
            return Object.assign(
                {},
                state,
                {
                    importerData: Object.assign(
                        {},
                        state.importerData,
                        {
                            noteNeedImage: [
                                ...state.importerData.noteNeedImage,
                                action.payload
                            ]
                        }
                    )
                }
            )  
        case ImporterActions.SET_NOTE_NEED_IMAGE_ALL :
            return Object.assign(
                {},
                state,
                {
                    importerData: Object.assign(
                        {},
                        state.importerData,
                        {
                            noteNeedImage: action.payload
                        }
                    )
                }
            )  
        case ImporterActions.RESET_STATE:
            state = InitState 
            return state
        case ImporterActions.SET_ADVANCE_SEARCH:
            return Object.assign(
                {},
                state,
                {
                    advanceSearch: action.payload
                }
            )
        case ImporterActions.SET_PRODUCT_IMAGE_ALL :
            return Object.assign(
                {},
                state,
                {
                    importerData: Object.assign(
                        {},
                        state.importerData,
                        {
                            uploadProduct: action.payload
                        }
                    )
                }
            )
        case ImporterActions.CLEAR_ALL_DATA : 
            return InitState
        default:
            return state
    }
}