import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event, Performer, Guest, PerformerStatusUpdateResultDto, UpdatePerformerStatusDto, Task } from './models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private eventsUrl = 'http://localhost:5184/api/events';

  constructor(private http: HttpClient) {}

  // Получаем все события с сервера
  getEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(this.eventsUrl);
  }

  createStep1(event: Partial<Event>): Observable<Event> {
    if (event.id) {
      // Обновление
      return this.http.put<Event>(`${this.eventsUrl}`, event);
    } else {
      // Создание
      return this.http.post<Event>(`${this.eventsUrl}/create/step1`, event);
    }
  }
  
  resetCurrentEvent(): Observable<void> {
    return this.http.post<void>(`${this.eventsUrl}/reset`, {});
  }
  

  getCurrentStep1(): Observable<Event | null> {
    return this.http.get<Event>(`${this.eventsUrl}/create/step1`);
  }

  getGuests(): Observable<Guest[]> {
    return this.http.get<Guest[]>(`${this.eventsUrl}/create/step4`);
  }

  addGuest(guest: { guestInfo: string; idEvent: number }): Observable<void> {
    return this.http.post<void>(`${this.eventsUrl}/create/step4`, guest);
  }

  getEventById(id: number) {
    return this.http.get<Event>(`http://localhost:5184/api/events/${id}`);
  }

  getMyEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(this.eventsUrl);
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.eventsUrl}/${id}`);
  }

  getEventPerformers(eventId: number): Observable<Performer[]> {
    return this.http.get<Performer[]>(`${this.eventsUrl}/${eventId}/performers`);
  }

  addPerformerByLogin(login: string, eventId?: number): Observable<Performer> {
    const dto: any = { login };
    if (eventId) dto.idEvent = eventId;
    
    return this.http.post<Performer>(`${this.eventsUrl}/create/step2/add-by-login`, dto);
  }

  searchPerformers(criteria: {specialization: string, city: string | null}): Observable<any[]> {
    return this.http.post<any[]>(`${this.eventsUrl}/create/step2/search`, criteria);
  }

  addFoundPerformer(userId: number, login: string, eventId?: number): Observable<Performer> {
    const dto: any = { IdUser: userId, login };
    if (eventId) dto.idEvent = eventId;
    
    return this.http.post<Performer>(`${this.eventsUrl}/create/step2/add-found-performer`, dto);
  }

  updatePerformerStatus(performerId: number, newStatusId: number): Observable<PerformerStatusUpdateResultDto> {
    const dto: UpdatePerformerStatusDto = { performerId, newStatusId };
    return this.http.put<PerformerStatusUpdateResultDto>(
      `${this.eventsUrl}/create/step2/update-status`,
      dto
    );
  }

  getEventTasks(eventId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.eventsUrl}/${eventId}/tasks`);
  }

  createTask(taskData: any): Observable<any> {
    return this.http.post(`${this.eventsUrl}/create/step3`, taskData);
  }

  updateTaskStatus(taskId: number, statusId: number): Observable<any> {
    return this.http.put(`${this.eventsUrl}/create/step3/update-status`, {
      IdTask: taskId,
      IdStatus: statusId
    });
  }

  getEventGuests(eventId: number): Observable<Guest[]> {
    return this.http.get<Guest[]>(`${this.eventsUrl}/${eventId}/guests`);
  }
}