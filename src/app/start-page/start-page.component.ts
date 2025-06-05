import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthModalComponent } from '../auth-modal/auth-modal.component';

@Component({
  selector: 'app-start-page',
  standalone: true,
  imports: [CommonModule, AuthModalComponent],
  templateUrl: './start-page.component.html',
  styleUrls: ['./start-page.component.scss']
})
export class StartPageComponent {
  isModalOpen = false;
  modalMode: 'login' | 'register' = 'login';

  openModal(mode: 'login' | 'register'): void {
    this.modalMode = mode;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }
}
