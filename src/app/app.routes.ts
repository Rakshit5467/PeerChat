import { Routes } from '@angular/router';
import { LobbyComponent } from './lobby/lobby.component';
import { PeerchatComponent } from './peerchat/peerchat.component';

export const routes: Routes = [
    { path: 'peerchat', component: PeerchatComponent },
    { path: 'lobby', component: LobbyComponent },
    { path: '**', component: LobbyComponent }
];