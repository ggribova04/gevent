import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  user: User | null = null;
  firstName = '';
  lastName = '';
  middleName = '';

  constructor(
    private userService: UserService,
    private router: Router,
    public authService: AuthService
  ) {}

  // Инициализируем компонент
  ngOnInit(): void {
    this.loadUser(); // Загружаем данные пользователя
  }

  // Загрузка данных пользователя
  loadUser(): void {
    this.userService.getUserProfile().subscribe({
      next: (userData) => {
        this.user = userData;
        const parts = userData.fullName.split(' ');
        this.lastName = parts[0] || '';
        this.firstName = parts[1] || '';
        this.middleName = parts[2] || '';
        this.user.role = this.getRoleName((userData as any).idRole);
      },
      error: (err) => console.error('Ошибка при загрузке пользователя:', err)
    });
  }

  goEdit(): void {
    this.router.navigate(['profile/edit']);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  // Получение URL фотографии пользователя
  getPhotoUrl(): string {
    if (this.user?.photoUrl) {
      const baseUrl = 'http://localhost:5184';
      return `${baseUrl}/${this.user.photoUrl}`;
    }
    return '../../assets/photo.svg';
  }

  // Преобразование ID роли в текстовое представление
  getRoleName(idRole: number): string {
    switch (idRole) {
      case 1:
        return 'Администратор';
      case 2:
        return 'Исполнитель';
      case 3:
        return 'Сотрудник';
      default:
        return 'Неизвестно';
    }
  }
}