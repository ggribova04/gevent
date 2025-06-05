import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateEventService } from '../services/create-event.service';
import { EventService } from '../event.service';

@Component({
  selector: 'app-create-event-step1',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './create-event-step1.component.html',
  styleUrls: ['./create-event-step1.component.scss']
})

export class CreateEventStep1Component implements OnInit{
  title = '';
  date = '';
  time = '';
  isFormInvalid = false;
  private eventId?: number;

  @Input() activeStep!: number; // Получаем от родителя текущий активный шаг
  @Output() stepCompleted = new EventEmitter<void>(); // Событие завершения шага
  @Output() goToStep = new EventEmitter<number>(); // Событие перехода на конкретный шаг

  constructor(
    private createSvc: CreateEventService,
    private eventSvc: EventService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  // Инициализация компонента
  ngOnInit(): void {
    // Подписываемся на изменения параметров маршрута
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      // Если есть ID - загружаем данные мероприятия
      if (idParam) {
        this.eventId = +idParam;
        this.loadEventData(this.eventId);
      } else {
        this.loadFromServiceSnapshot();
      }
    });
  }

  // Загрузка данных из сервиса (при создании нового мероприятия)
  private loadFromServiceSnapshot() {
    const snap = this.createSvc.getSnapshot();

    if (snap.title || snap.date || snap.time) {
      this.title = snap.title ?? '';
      this.date = snap.date ?? '';
      this.time = snap.time ?? '';
    }
  }

  // Загрузка данных мероприятия (при редактировании)
  private loadEventData(id: number) {
    this.eventSvc.getEventById(id).subscribe({
      next: (eventData) => {
        if (eventData) {
          this.createSvc.loadFromServer(eventData);
          const snap = this.createSvc.getSnapshot();
          this.title = snap.title ?? '';
          this.date = snap.date ?? '';
          this.time = snap.time ?? '';
        }
      },
      error: (err) => console.error('Ошибка загрузки мероприятия по ID', err)
    });
  }

  nextStep() {
    if (!this.validateForm()) {
      this.isFormInvalid = true;
      return;
    }

    this.saveStepData();

    const payload = this.createSvc.getSnapshot();

    // Сохраняем данные шага 1
    this.eventSvc.createStep1(payload).subscribe({
      next: (savedEvent) => {
        this.createSvc.loadFromServer(savedEvent); // Сохраняем id
        this.createSvc.setCurrentEventId(savedEvent.id);
        this.stepCompleted.emit();
      },
      error: (err) => console.error('Ошибка при сохранении шага 1:', err)
    });
  }

  navigateTo(step: number) {
    if (!this.validateForm()) {
      this.isFormInvalid = true;
      return;
    }

    this.saveStepData();

    const payload = this.createSvc.getSnapshot();

    this.eventSvc.createStep1(payload).subscribe({
      next: (savedEvent) => {
        this.createSvc.loadFromServer(savedEvent); // Сохраняем id
        this.createSvc.setCurrentEventId(savedEvent.id);
        this.goToStep.emit(step);
      },
      error: (err) => console.error('Ошибка при сохранении шага 1:', err)
    });
  }

  // Валидация формы
  private validateForm(): boolean {
    const isTitleValid = !!this.title.trim();
    const isTimeValid = !!this.time.trim();
    const isDateValid = this.eventId ? true : (!!this.date && this.isDateTodayOrFuture(this.date));
    
    if (!isDateValid && !this.eventId) {
      alert('Пожалуйста, введите корректную дату. Дата не может быть в прошлом.');
    }

    return isTitleValid && isTimeValid && isDateValid;
  }

  // Сохранение данных шага в сервисе
  private saveStepData() {
    this.createSvc.setStep1({
      title: this.title,
      date: this.date,
      time: this.time
    });
  }

  // Проверка адекватности даты
  private isDateTodayOrFuture(inputDate: string): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(inputDate);
    selectedDate.setHours(0, 0, 0, 0);

    return selectedDate >= today;
  }

  goUserProfile(){
    this.createSvc.reset();
    this.eventSvc.resetCurrentEvent().subscribe({
        next: () => console.log('Сессия мероприятия сброшена'),
        error: err => console.error('Ошибка при сбросе сессии:', err)
      });
    this.router.navigate(['/profile']);
  }

  goBack(){
    this.createSvc.reset();
    this.eventSvc.resetCurrentEvent().subscribe({
        next: () => console.log('Сессия мероприятия сброшена'),
        error: err => console.error('Ошибка при сбросе сессии:', err)
      });
    this.router.navigate(['/events']);
  }
}