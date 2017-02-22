import { Action } from '@ngrx/store';
import { UserActions } from '../actions/user.actions';
import { User } from '../models/user.model';

export interface UserState {
    data: User
    offlineMode: boolean
}

const InitState : UserState = {
    data : {},
    offlineMode: false
}

export function UserReducer (state = InitState , action: Action ) {
    switch(action.type) {
        case UserActions.ADD_USER_DATA :
            return Object.assign(
                {},
                state,
                {
                    data: action.payload
                }
            )
        case UserActions.REMOVE_USER_DATA :
            return Object.assign(
                {},
                state,
                {
                    data: action.payload
                }
            )
        case UserActions.USE_OFFLINE_MODE :
            return Object.assign({} , state , { offlineMode: true })
        case UserActions.CLOSE_OFFLINE_MODE :
            return Object.assign({} , state , { offlineMode: false })
        default :
            return state
    }
} 