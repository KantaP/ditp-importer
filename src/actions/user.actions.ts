import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';

import { User } from '../models/user.model';


@Injectable()
export class UserActions {
    static ADD_USER_DATA = 'ADD_USER_DATA'
    addUserData(user: User) :Action {
        return {
            type: UserActions.ADD_USER_DATA,
            payload: user
        }
    }
    
    static REMOVE_USER_DATA = 'REMOVE_USER_DATA'
    removeUserData(): Action {
        return {
            type: UserActions.REMOVE_USER_DATA,
            payload: {}
        }
    }

    static USE_OFFLINE_MODE = 'USE_OFFLINE_MODE'
    useOfflineMode() : Action {
        return {
            type: UserActions.USE_OFFLINE_MODE
        }
    }

    static CLOSE_OFFLINE_MODE = 'CLOSE_OFFLINE_MODE'
    closeOfflineMode() : Action {
        return {
            type: UserActions.CLOSE_OFFLINE_MODE
        }
    }
} 