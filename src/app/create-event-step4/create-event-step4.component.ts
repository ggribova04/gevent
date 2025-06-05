import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventService } from '../event.service'
import { Guest } from '../models/event.model';
import { CreateEventService } from '../services/create-event.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-create-event-step4',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './create-event-step4.component.html',
  styleUrls: ['./create-event-step4.component.scss']
})
export class CreateEventStep4Component implements OnInit {
  guests: Guest[] = [];
  currentGuest = '';

  @Input() activeStep!: number;
  @Output() goToStep = new EventEmitter<number>();

  private eventId?: number;

  constructor(
    private createSvc: CreateEventService,
    private eventService: EventService,
    private router: Router,
    private http: HttpClient,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadEventData();
  }

    private loadEventData(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        // Режим редактирования - загрузка с сервера
        this.eventId = +idParam;
        this.createSvc.setEventId(this.eventId);
        this.loadGuestsFromServer();
      } else {
        // Режим создания - загрузка из памяти
        const eventId = this.createSvc.getEventId();
        if (eventId) {
          this.eventId = eventId;
          this.loadGuestsFromServer();
        } else {
          console.error('Не удалось определить ID мероприятия');
        }
      }
    });
  }

  private loadGuestsFromServer(): void {
    if (!this.eventId) return;

    this.eventService.getEventGuests(this.eventId).subscribe({
      next: (guests) => {
        this.guests = guests;
        this.createSvc.setGuests(guests);
      },
      error: (err) => {
        alert(`Ошибка загрузки гостей: ${err.message}`);
      }
    });
  }

  addGuest(): void {
    const guestName = this.currentGuest.trim();
    if (!guestName || this.eventId === undefined) {
      console.error('guestName или eventId не заданы');
      return;
    }

    const guestToSend = {
      guestInfo: guestName,
      idEvent: this.eventId
    };

    this.eventService.addGuest(guestToSend).subscribe({
      next: () => {
        this.loadGuestsFromServer();
        this.currentGuest = '';
      },
      error: (err) => {
        console.error('Ошибка добавления гостя', err);
      }
    });
  }

  finish() {
    if (this.currentGuest.trim()) {
      this.addGuest();
    } else {
      // Если поле пустое — просто очищаем и переходим
      this.createSvc.reset();
      this.router.navigate(['/events']);
      this.eventService.resetCurrentEvent().subscribe({
        next: () => console.log('Сессия мероприятия сброшена'),
        error: err => console.error('Ошибка при сбросе сессии:', err)
      });
    }
  }

  navigateTo(step: number) {
    // Отправляем событие с номером шага
    this.goToStep.emit(step);
  }

  goUserProfile(){
    this.createSvc.reset();
    this.eventService.resetCurrentEvent().subscribe({
        next: () => console.log('Сессия мероприятия сброшена'),
        error: err => console.error('Ошибка при сбросе сессии:', err)
      });
    this.router.navigate(['/profile']);
  }

  goBack(){
    this.createSvc.reset();
    this.eventService.resetCurrentEvent().subscribe({
        next: () => console.log('Сессия мероприятия сброшена'),
        error: err => console.error('Ошибка при сбросе сессии:', err)
      });
    this.router.navigate(['/events']);
  }
}
