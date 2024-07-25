import { CommonModule } from '@angular/common';
import {
  Component,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { PeerchatComponent } from './peerchat/peerchat.component';
import { LobbyComponent } from './lobby/lobby.component';
declare const AgoraRTM: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [CommonModule, PeerchatComponent, LobbyComponent, RouterOutlet],
  styleUrls: ['./app.component.css'],
  standalone: true,
})
export class AppComponent {
  title = 'WebRTC';

}
