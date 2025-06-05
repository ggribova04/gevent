import { Injectable } from '@angular/core';
import { Event, Guest, Performer, Task } from '../models/event.model';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { PerformerStatusUpdateResultDto, UpdatePerformerStatusDto } from '../models/event.model';

@Injectable({ 
  providedIn: 'root' 
})

export class CreateEventService {
  private readonly STORAGE_KEY = 'event_creation_data';
  private currentEventId?: number;
  private formData: any = {};

  private eventData: Partial<Event> = {
    title: '',
    date: '',
    time: '',
    performers: [],
    tasks: [],
    guests: []
  };

constructor(private http: HttpClient){
  const stored = sessionStorage.getItem(this.STORAGE_KEY);
  if (stored) {
    this.eventData = JSON.parse(stored);
  }

  const savedId = sessionStorage.getItem('current_event_id');
  if (savedId) {
    this.eventId = +savedId;
  }
}
  private performers: Performer[] = [];

  private apiUrl = 'http://localhost:5184/api';

  private saveToStorage() {
    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.eventData));
  }

  getPerformers(): Performer[] {
    return this.performers;
  }

  private eventId: number | null = null;

  setEventId(id: number) {
    this.eventId = id;
    sessionStorage.setItem('current_event_id', id.toString());
  }

  getEventId(): number | null {
    return this.eventId;
  }

  setCurrentEventId(id: number) {
    this.eventId = id;
  }

  // Сохраняем данные с шага 1
  setStep1(data: { title: string; date: string; time: string }) {
    this.eventData = { ...this.eventData, ...data };
    this.saveToStorage();
  }

  loadFromServer(serverData: Event) {
    this.eventData = { ...serverData };
  }
  
  // Сохраняем список гостей
  setGuests(guests: Guest[]) {
    const current = this.eventData;
    this.eventData = ({ ...current, guests });
    this.saveToStorage();
  }

  getGuests(): Guest[] {
    return this.eventData.guests ?? [];
  }

  // Возвращаем текущее состояние формы
  getSnapshot(): Partial<Event> {
    return this.eventData;
  }

  setPerformers(performers: Performer[]) {
    this.eventData.performers = performers;
    this.saveToStorage();
  }
  
  // Сбрасываем данные полей после сохранения
  reset(): void {
    this.eventData = {
      title: '',
      date: '',
      time: '',
      performers: [],
      tasks: [],
      guests: []
    };
    sessionStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem('current_event_id');
  }

  resetPerformers(): void {
    this.eventData.performers = [];
  }

  // Сохраняем список задач
  setTasks(tasks: Task[]) {
    this.eventData.tasks = tasks;
    this.saveToStorage();
  }

  getTasks(): Task[] {
    return this.eventData.tasks ?? [];
  }

  // Сбрасываем только задачи
  resetTasks(): void {
    this.eventData.tasks = [];
  }

  getMyTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/events/tasks`);
  }

  getMyPerformers(): Observable<Performer[]> {
    return this.http.get<Performer[]>(`${this.apiUrl}/events/performers`);
  }

  updatePerformerStatus(performerId: number, newStatusId: number): Observable<PerformerStatusUpdateResultDto> {
    return this.http.put<PerformerStatusUpdateResultDto>(
      `${this.apiUrl}/events/create/step2/update-status`,
      { performerId, newStatusId }
    );
  }
}