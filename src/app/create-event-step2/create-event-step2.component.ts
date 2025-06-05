import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateEventService } from '../services/create-event.service';
import { Performer } from '../models/event.model';
import { HttpClient } from '@angular/common/http';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../event.service';

@Component({
  selector: 'app-create-event-step2',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './create-event-step2.component.html',
  styleUrls: ['./create-event-step2.component.scss']
})
export class CreateEventStep2Component implements OnInit {
  @Input() activeStep!: number;
  @Output() stepCompleted = new EventEmitter<void>();
  @Output() goToStep = new EventEmitter<number>();

  performers: Performer[] = [];
  searchResults: any[] = [];
  newPerformerLogin: string = '';
  searchServiceName: string = '';
  selectedCity: string = '';
  showSearchResults = false;

  private eventId?: number;

  constructor(
    private createSvc: CreateEventService, 
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private eventSvc: EventService
  ) {}

  // Инициализация компонента
  ngOnInit(): void {
    this.loadEventData();
  }

  // Загрузка данных мероприятия в зависимости от режима (создание/редактирование)
  private loadEventData(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.eventId = +idParam;
        this.createSvc.setEventId(this.eventId);
        this.loadPerformersFromServer();
      } else {
        const eventId = this.createSvc.getEventId();
        if (eventId) {
          this.eventId = eventId;
          this.loadPerformersFromServer();
        } else {
          console.error('Не удалось определить ID мероприятия');
        }
      }
    });
  }

  // Загрузка исполнителей с сервера
  private loadPerformersFromServer(): void {
    if (!this.eventId) return;

    this.eventSvc.getEventPerformers(this.eventId).subscribe({
      next: (performers) => {
        this.performers = performers;
        this.createSvc.setPerformers(this.performers);
      },
      error: (err) => {
        alert(`Ошибка загрузки исполнителей: ${err.message}`);
      }
    });
  }

  // Добавление исполнителя по логину
  addPerformer(): void {
    if (!this.newPerformerLogin.trim()) return;

    this.eventSvc.addPerformerByLogin(this.newPerformerLogin.trim(), this.eventId).subscribe({
      next: (performer) => {
        this.performers.push(performer);
        this.createSvc.setPerformers(this.performers);
        this.clearPerformerFields();
      },
      error: (err) => {
        alert(`Ошибка при добавлении: ${err.error}`);
      }
    });
  }

  // Поиск исполнителей по специализации и городу
  searchPerformers(): void {
    if (!this.searchServiceName.trim()) {
      alert('Укажите специализацию для поиска');
      return;
    }

    const searchCriteria = {
      specialization: this.searchServiceName.trim(),
      city: this.selectedCity.trim() || null,
    };

    this.eventSvc.searchPerformers(searchCriteria).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.showSearchResults = true;
      },
      error: (err) => {
        alert(`Ошибка при поиске: ${err.error}`);
      }
    });
  }

  // Добавление исполнителя по результатам поиска
  addFromSearch(index: number): void {
    const performer = this.searchResults[index];
    
    this.eventSvc.addFoundPerformer(performer.id, performer.login, this.eventId).subscribe({
      next: (newPerformer) => {
        this.performers.push(newPerformer);
        this.createSvc.setPerformers(this.performers);
        this.clearPerformerFields();
        this.showSearchResults = false;
      },
      error: (err) => {
        alert(`Ошибка при добавлении: ${err.error}`);
      }
    });
  }

  // Изменение статуса задачи
  toggleStatus(index: number): void {
    const performer = this.performers?.[index];
    if (!performer) {
      alert('Исполнитель не найден');
      return;
    }

    const newStatusId = performer.statusId === 0 ? 1 : 0;

    this.eventSvc.updatePerformerStatus(performer.id, newStatusId).subscribe({
      next: (response) => {
        performer.statusId = response.newStatusId;
        performer.status = response.statusName;
        this.createSvc.setPerformers(this.performers);
      },
      error: (err) => {
        alert('Ошибка при обновлении статуса');
      }
    });
  }

  nextStep() {
    this.createSvc.setPerformers(this.performers);
    this.clearAllFields();
    this.stepCompleted.emit();
  }

  navigateTo(step: number) {
    this.createSvc.setPerformers(this.performers);
    this.clearAllFields();
    this.goToStep.emit(step);
  }

  // Методы для очистки полей
  private clearPerformerFields() {
    this.newPerformerLogin = '';
  }

  private clearSearchFields() {
    this.searchServiceName = '';
    this.selectedCity = '';
  }

  private clearAllFields() {
    this.clearPerformerFields();
    this.clearSearchFields();
    this.searchResults = [];
    this.showSearchResults = false;
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
