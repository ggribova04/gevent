import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event } from './models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private eventsUrl = 'http://localhost:3000/events';

  constructor(private http: HttpClient) {}

  // Получаем все события с сервера
  getEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(this.eventsUrl);
  }

  // Отправляем событие на сервер
  createEvent(eventData: Omit<Event, 'id'>): Observable<Event> {
    const eventWithId = {
      ...eventData,
      id: this.generateId()
    };
    return this.http.post<Event>(this.eventsUrl, eventWithId);
  }

  // Генерируем ID
  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }
}