import { ImporterState } from '../reducers/importer.reducer';
import { UserState } from '../reducers/user.reducer';
import { RouteState } from '../reducers/route.reducer';

export interface AppState {
    importerState: ImporterState,
    userState: UserState,
    routeState: RouteState
}