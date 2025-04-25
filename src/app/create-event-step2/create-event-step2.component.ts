import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventService } from '../event.service'
import { Guest } from '../models/event.model';
import { CreateEventService } from '../services/create-event.service';

@Component({
  selector: 'app-create-event-step2',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './create-event-step2.component.html',
  styleUrls: ['./create-event-step2.component.scss']
})
export class CreateEventStep2Component {
  guests: string[] = [];
  currentGuest = '';

  @Input() activeStep!: number; // Получаем от родителя
  @Output() stepBack = new EventEmitter<void>(); // Уведомляем родителя


  constructor(
    private createSvc: CreateEventService,
    private eventService: EventService,
    private router: Router,
  ) {
    // Получаем даныые и преобразуем их в массив строк
    const snapshot = this.createSvc.getSnapshot();
    this.guests = snapshot.guests ? snapshot.guests.map(g => g.fullName) : [];
  }

  addGuest() {
    if (this.currentGuest.trim()) {
      this.guests.push(this.currentGuest.trim()); // Добавляем нового гостя в массив
      this.currentGuest = '';
    }
  }

  finish() {
    const guests: Guest[] = this.guests.map(name => ({ fullName: name }));
  
    // Сохраняем гостей в сервисе
    this.createSvc.setGuests(guests);
    
    // Получаем полные данные события
    const eventData = this.createSvc.getSnapshot();
    
    // Сохраняем данные на сервер
    this.eventService.createEvent(eventData).subscribe({
      next: () => {
        this.createSvc.reset();
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Ошибка сохранения', err);
      }
    });
  }

  goBack() {
    const guests: Guest[] = this.guests.map(name => ({ fullName: name }));
    this.createSvc.setGuests(guests);

    this.stepBack.emit(); 
  }
}
