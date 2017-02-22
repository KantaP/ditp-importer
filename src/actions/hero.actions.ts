import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';

import { Hero } from '../models/hero.model';


@Injectable()
export class HeroActions {
    static ADD_HERO = 'ADD_HERO';
    addHero(hero: Hero): Action {
        return {
            type: HeroActions.ADD_HERO,
            payload: hero
        }
    }

    static UPDATE_HERO = 'UPDATE_HERO';
    updateHero(hero: Hero): Action {
        return {
            type: HeroActions.UPDATE_HERO,
            payload: hero
        }
    }

    static DELETE_HERO = 'DELETE_HERO';
    deleteHero(hero: Hero): Action {
        return {
            type: HeroActions.DELETE_HERO,
            payload: hero
        }
    }
} 