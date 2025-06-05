import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-user-profile-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile-edit.component.html',
  styleUrls: ['./user-profile-edit.component.scss']
})
export class UserProfileEditComponent implements OnInit {
  user: User = {
    id: 0,
    fullName: '',
    email: '',
    role: '',
    photoUrl: '',
    specialization: '',
    city: '',
    description: ''
  };

  selectedFile: File | null = null;
  firstName = '';
  lastName = '';
  middleName = '';
  selectedPhoto: File | null = null;

  constructor(
    private userService: UserService,
    public authService: AuthService,
    private router: Router
  ) {}

  // Инициализируем компонент
  ngOnInit(): void {
    this.loadUser(); // Загружаем данные пользователя для редактирования
  }

  // Загрузка данных пользователя
  loadUser(): void {
    this.userService.getUserProfile().subscribe({
      next: (userData) => {
        this.user = userData;

        const parts = userData.fullName?.split(' ') ?? [];
        this.lastName = parts[0] || '';
        this.firstName = parts[1] || '';
        this.middleName = parts[2] || '';
        this.user.role = this.getRoleName((userData as any).idRole);
      },
      error: (err) => {
        console.error('Ошибка при загрузке пользователя:', err);
      }
    });
  }

  // Обработчик выбора фотографии
  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedPhoto = input.files[0];

      // Загрузка фото на сервер
      this.userService.uploadPhoto(this.selectedPhoto).subscribe({
        next: (res) => {
          if (this.user) {
            this.user.photoUrl = res.path;
          }
        },
        error: (err) => {
          console.error('Ошибка при загрузке фото:', err);
        }
      });
    }
  }

  // Сохранение изменений профиля
  saveChanges(): void {
    if (!this.user) return;

    // Составляем ФИО из полей
    this.user.fullName = `${this.lastName} ${this.firstName} ${this.middleName}`.trim();

    // Защита от изменения роли
    const originalRole = this.user.role;

    this.userService.updateUserProfile(this.user).subscribe({
      next: () => {
        this.router.navigate(['/profile']);
      },
      error: (err) => {
        console.error('Ошибка при сохранении данных:', err);
        // Восстановить роль в случае ошибки
        this.user.role = originalRole;
      }
    });
  }

  // Получение URL фотографии пользователя
  getPhotoUrl(): string {
    if (this.user?.photoUrl) {
      const baseUrl = 'http://localhost:5184';
      return `${baseUrl}/${this.user.photoUrl}`;
    }
    return '../../assets/photo.svg'; // Фото по умолчанию
  }

  goBack(): void {
    this.router.navigate(['/profile']);
  }

  isExecutor(): boolean {
    return this.user?.role === 'Исполнитель';
  }

  // Конвертация ID роли в текстовое представление
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

  // При удалении аватара устанавливаем дефолтное фото
  removeAvatar(): void {
    if (this.user) {
      this.user.photoUrl = undefined;
    }
  }
}