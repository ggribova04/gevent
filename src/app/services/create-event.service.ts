import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Event, Guest } from '../models/event.model';

@Injectable({ providedIn: 'root' })
export class CreateEventService {
  private defaultState: Omit<Event, 'id'> = {
    title: '',
    date: '',
    time: '',
    guests: []
  };
  private eventData: Omit<Event, 'id'> = this.defaultState;
  //eventData$ = this.eventData.asObservable(); // Подписка на изменения

  // Сохраняем данные с шага 1
  setStep1(data: { title: string; date: string; time: string }) {
    const current = this.eventData;
    this.eventData = ({ ...current, ...data });
  }

  // Сохраняем список гостей
  setGuests(guests: Guest[]) {
    const current = this.eventData;
    this.eventData = ({ ...current, guests });
  }

  // Возвращаем текущее состояние формы
  getSnapshot(): Omit<Event, 'id'> {
    return this.eventData;
  }

  // Сбрасываем данные полей после сохранения
  reset(): void {
    this.eventData = (this.defaultState);
  }
}