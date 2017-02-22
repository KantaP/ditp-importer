import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';

import { AdvanceSearch } from '../models/importer.model';

@Injectable()
export class SearchActions {
    static SET_ADVANCE_SEARCH = 'SET_ADVANCE_SEARCH'
    setAdvanceSearch(advanceSearchValue: AdvanceSearch) : Action {
        return {
            type: SearchActions.SET_ADVANCE_SEARCH,
            payload: advanceSearchValue
        }
    }
}

