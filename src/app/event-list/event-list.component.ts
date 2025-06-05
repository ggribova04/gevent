import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { EventService } from '../event.service';
import { Event } from '../models/event.model';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterModule],
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss'],
  providers: [DatePipe]
})
export class EventListComponent implements OnInit {
  events: Event[] = [];
  private eventId?: number;

  constructor(
    private eventSvc: EventService,
    private router: Router
  ) {}
  
  combineDateTime(date: string, time: string): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const result = new Date(date);
    result.setHours(hours, minutes);
    return result;
  }
  
  ngOnInit(): void {
    this.eventSvc.getEvents().subscribe({
      next: (events) => {
        this.events = events;
      },
      error: (err) => {
        console.error('Error loading events:', err);
      }
    });
  }

  openEditForm(event: Event) {
    this.router.navigate(['/events/edit', event.id, 'step1']);
  }

  goUserProfile(){
    this.router.navigate(['/profile']);
  }

  goBack(){
    this.router.navigate(['/main']);
  }

  deleteEvent(e: MouseEvent, id: number): void {
    e.stopPropagation(); // Игнорируем клик по карточке при наведении на кнопку делита

    const confirmed = confirm('Вы уверены, что хотите удалить мероприятие?');
    if (!confirmed) return;

    this.eventSvc.deleteEvent(id).subscribe({
      next: () => {
        this.events = this.events.filter(event => event.id !== id);
        alert('Мероприятие удалено');
      },
      error: (err) => {
        console.error('Ошибка при удалении:', err);
        alert('Ошибка при удалении мероприятия');
      }
    });
  }

}