import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service'

@Component({
  selector: 'app-auth-modal',
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class AuthModalComponent {
  @Input() mode: 'login' | 'register' = 'login';
  @Output() close = new EventEmitter<void>();
  @Output() authSuccess = new EventEmitter<any>();

  loginForm: FormGroup;
  registerForm: FormGroup;
  passwordMismatch = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
  ) {
    this.loginForm = this.fb.group({
      identifier: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required]],
      userName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      idRole: ['', Validators.required],
      specialization: [''],
      city: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });

    // Подписка на изменения роли для динамической валидации
    this.registerForm.get('idRole')?.valueChanges.subscribe(role => {
      const specialization = this.registerForm.get('specialization');
      const city = this.registerForm.get('city');
      
      if (role === '2') {
        specialization?.setValidators([Validators.required]);
        city?.setValidators([Validators.required]);
      } else {
        specialization?.clearValidators();
        city?.clearValidators();
        specialization?.setValue('');
        city?.setValue('');
      }
      specialization?.updateValueAndValidity();
      city?.updateValueAndValidity();
    });

    // Подписка на изменения паролей для проверки совпадения
    this.registerForm.get('password')?.valueChanges.subscribe(() => {
      this.checkPasswordMatch();
    });

    this.registerForm.get('confirmPassword')?.valueChanges.subscribe(() => {
      this.checkPasswordMatch();
    });
  }

  // Валидатор для проверки совпадения паролей
  private passwordMatchValidator(group: AbstractControl): { [key: string]: any } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  // Проверка совпадения паролей
  private checkPasswordMatch(): void {
    const password = this.registerForm.get('password')?.value;
    const confirmPassword = this.registerForm.get('confirmPassword')?.value;
    this.passwordMismatch = password !== confirmPassword;
  }
  
  switchMode(mode: 'login' | 'register'): void {
    this.mode = mode;
    this.errorMessage = null;
    this.passwordMismatch = false;
  }

  onClose(): void {
    this.close.emit();
    this.loginForm.reset();
    this.registerForm.reset();
    this.passwordMismatch = false;
    this.errorMessage = null;
  }

  // Обработчик для смены режима в окне входа
  async onSubmit(): Promise<void> {
    if (this.mode === 'login') {
      await this.handleLogin();
    } else {
      await this.handleRegister();
    }
  }

  // Авторизация пользователя
  private handleLogin(): void {
    if (!this.loginForm.valid) return;

    this.errorMessage = null;

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.authService.saveAuthData(response);
        this.onClose();
        this.router.navigate(['/main']);
      },
      error: (error) => {
        console.error('Login error', error);
        this.errorMessage = error.error?.message || 'Неверные учетные данные';
      }
    });
  }

  // Регистрация пользователя
  private handleRegister(): void {
    if (!this.registerForm.valid || this.passwordMismatch) return;

    this.errorMessage = null;

    const formData = {
      ...this.registerForm.value,
      idRole: Number(this.registerForm.value.idRole)
    };
    
    this.authService.register(formData).subscribe({
      next: (response) => {
        this.authService.saveAuthData(response);
        this.authService.saveAuthData(response);
        this.router.navigate(['/main']);
      },
      error: (error) => {
        console.error('Registration error', error);
        this.errorMessage = error.error?.message || 'Ошибка регистрации';
      }
    });
  }
}