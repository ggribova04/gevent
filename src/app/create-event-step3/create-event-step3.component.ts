import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateEventService } from '../services/create-event.service';
import { Task } from '../models/event.model';
import { Router, ActivatedRoute } from '@angular/router';
import { EventService } from '../event.service';

@Component({
  selector: 'app-create-event-step3',
  imports: [CommonModule, FormsModule],
  templateUrl: './create-event-step3.component.html',
  styleUrls: ['./create-event-step3.component.scss']
})
export class CreateEventStep3Component implements OnInit {
  @Input() activeStep!: number;
  @Output() stepCompleted = new EventEmitter<void>();
  @Output() goToStep = new EventEmitter<number>();
  
  tasks: Task[] = [];
  newTask = {
    title: '',
    description: '',
    date: '',
    login: ''
  };

  isTaskDateInvalid = false;

  private eventId?: number;

  constructor(
    private createSvc: CreateEventService, 
    private route: ActivatedRoute,
    private router: Router,
    private eventSvc: EventService
  ) {}

  ngOnInit(): void {
    this.loadEventData();
  }

  // Загрузка данных в зависимости от режима (создание/редактирование)
  private loadEventData(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        // Режим редактирования - загрузка с сервера
        this.eventId = +idParam;
        this.createSvc.setEventId(this.eventId);
        this.loadTasksFromServer();
      } else {
        // Режим создания - загрузка из памяти
        const eventId = this.createSvc.getEventId();
        if (eventId) {
          this.eventId = eventId;
          this.loadTasksFromServer();
        } else {
          console.error('Не удалось определить ID мероприятия');
        }
      }
    });
  }

  // Загрузка задач с сервера
  private loadTasksFromServer(): void {
    if (!this.eventId) return;

    this.eventSvc.getEventTasks(this.eventId).subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.createSvc.setTasks(tasks);
      },
      error: (err) => {
        alert(`Ошибка загрузки задач: ${err.message}`);
      }
    });
  }

  // Добавление новой задачи
  addTask(): void {
    if (!this.validateTask()) return;

    const taskToSend = {
      ...this.newTask,
      idEvent: this.eventId
    };

    this.eventSvc.createTask(taskToSend).subscribe({
      next: () => {
        if (this.eventId) {
          this.loadTasksFromServer();
        }
        this.clearTaskFields();
      },
      error: (err) => {
        alert(`Ошибка при создании задачи: ${err.error}`);
      }
    });
  }

  // Валидация данных
  private validateTask(): boolean {
    const { title, login, date } = this.newTask;
    const isFilled = !!title?.trim() && !!login?.trim() && !!date;
    
    this.isTaskDateInvalid = !this.isDateValid(date);

    if (this.isTaskDateInvalid) {
      alert('Пожалуйста, введите корректную дату. Дата не может быть в прошлом.');
    }

    return isFilled && !this.isTaskDateInvalid;
  }

  private isDateValid(dateStr: string): boolean {
    const selectedDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  }
  
  // Изменение статуса задачи
  toggleTaskStatus(index: number): void {
    const task = this.tasks[index];
    const newStatusId = task.statusId === 0 ? 1 : 0;

    this.eventSvc.updateTaskStatus(task.id, newStatusId).subscribe({
      next: () => {
        // Обновляем статус в интерфейсе
        task.statusId = newStatusId;
        task.status = newStatusId === 1 ? 'Выполнено' : 'Не выполнено';
        this.createSvc.setTasks(this.tasks);
      },
      error: (err) => {
        const errorMessage = err.error?.message || 'Произошла ошибка при смене статуса';
        alert(`Ошибка при смене статуса: ${errorMessage}`);
      }
    });
  }

  nextStep() {
    this.saveData();
    this.clearAllFields();
    this.stepCompleted.emit();
  }

  navigateTo(step: number) {
    this.saveData();
    this.clearAllFields();
    this.goToStep.emit(step);
  }

  private saveData() {
    this.createSvc.setTasks([...this.tasks]);
  }

  private clearTaskFields(): void {
    this.newTask = {
      title: '',
      description: '',
      date: '',
      login: ''
    };
  }

  private clearAllFields() {
    this.clearTaskFields();
    this.tasks = [];
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
