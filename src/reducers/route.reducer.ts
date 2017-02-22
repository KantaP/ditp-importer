import { Action } from '@ngrx/store';
import { RouteActions } from '../actions/route.actions';

export interface RouteState {
    route: string
}

const initState : RouteState = {
    route: 'login'
}

export function RouteReducer (state = initState , action: Action) {
    switch(action.type) {
        case RouteActions.SET_CURRENT_ROUTE :
            return Object.assign(
                {},
                state, 
                {
                    route: action.payload
                }
            )
        default :
            return state
    }
}