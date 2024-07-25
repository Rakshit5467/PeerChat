import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import {MatButtonModule} from '@angular/material/button'


@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [MatFormFieldModule,CommonModule, FormsModule, MatInputModule, RouterLink, MatButtonModule],
  templateUrl: './lobby.component.html',
  styleUrl: './lobby.component.css'
})
export class LobbyComponent {

  constructor(private router: Router){}

  roomId!: any;

  navigateToRoom() {
    this.router.navigate(['/peerchat'], { queryParams: { room: this.roomId } });
  }
}
