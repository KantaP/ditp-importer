import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';

@Injectable()
export class RouteActions {
    static SET_CURRENT_ROUTE = 'SET_CURRENT_ROUTE';
    setCurrentRoute(route: string) : Action {
        return {
            type: RouteActions.SET_CURRENT_ROUTE,
            payload: route
        }
    }
}