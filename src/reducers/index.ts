
import { compose } from '@ngrx/core/compose';
import { storeLogger } from 'ngrx-store-logger';
import { combineReducers } from '@ngrx/store';

import * as fromUser from './user.reducer';
import * as fromImporter from './importer.reducer';


export function reducers(){
    return compose(storeLogger(), combineReducers)({
        userState: fromUser.UserReducer,
        importerState: fromImporter.ImporterReducer,
    });
} 

