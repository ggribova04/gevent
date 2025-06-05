import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'angular-calendar';
import { addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameDay, isSameMonth, format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { EventService } from '../event.service';
import { Task } from '../models/event.model';
import { HttpClient } from '@angular/common/http';
import { CreateEventService } from '../services/create-event.service';
import { firstValueFrom } from 'rxjs';
import { Performer } from '../models/event.model';
import { AuthService } from '../services/auth.service';

interface CalendarDay {
  date: Date;
  inMonth: boolean;
  events: any[];
  isToday: boolean;
}

type ListItem = Task | Performer;

interface UpdateTaskStatusDto {
  idTask: number;
  idStatus: number;
}

@Component({
  standalone: true,
  selector: 'app-main-page',
  imports: [CommonModule, FormsModule, CalendarModule],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements OnInit, AfterViewInit, OnDestroy {
  isMenuOpen = false;

  @ViewChild('menuRef') menuRef!: ElementRef;
  private clickListener!: (event: MouseEvent) => void;

  viewDate: Date = new Date();
  calendarDays: CalendarDay[] = [];
  tasks: Task[] = [];
  performers: Performer[] = [];
  items: Array<(Task & { type: 'task' }) | (Performer & { type: 'performer' })> = [];

  calendarEvents: { start: Date; title: string }[] = [];

  private eventsUrl = 'http://localhost:5184/api/events';

  userRole: number = 0;

  constructor(
    private router: Router,
    private http: HttpClient,
    private eventSvc: EventService,
    private createSvc: CreateEventService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    this.eventSvc.getMyEvents().subscribe(events => {
      this.calendarEvents = events.map(e => {
        // Соединить DateOnly и TimeOnly в Date
        const combinedDate = new Date(`${e.date}T${e.time}`);
        return {
          start: combinedDate,
          title: e.title
        };
      });

      this.generateCalendar();
    });
    
    this.createSvc.getMyTasks().subscribe(tasks => {
      this.tasks = tasks.map(t => ({ ...t, type: 'task' as const }));
      this.updateItems();
    });

    this.createSvc.getMyPerformers().subscribe(performers => {
      this.performers = performers.map(p => ({ ...p, type: 'performer' as const }));
      this.updateItems();
    });
  }

  updateItems() {
    this.items = [
      ...(this.tasks as (Task & { type: 'task' })[] || []), 
      ...(this.performers as (Performer & { type: 'performer' })[] || [])
    ];
  }

  isTask(item: ListItem): item is Task {
    return 'title' in item && 'date' in item;
  }

  generateCalendar() {
    this.calendarDays = [];

    const startMonth = startOfMonth(this.viewDate);
    const endMonth = endOfMonth(this.viewDate);

    // Начало недели, в которой первый день месяца (понедельник - если weekStartsOn=1)
    const startDate = startOfWeek(startMonth, { weekStartsOn: 1 });
    // Конец недели, в которой последний день месяца
    const endDate = endOfWeek(endMonth, { weekStartsOn: 1 });

    let date = startDate;

    while (date <= endDate) {
      // Найти события на этот день
      const dayEvents = this.calendarEvents.filter(e => isSameDay(e.start, date));

      this.calendarDays.push({
        date,
        inMonth: isSameMonth(date, this.viewDate),
        events: dayEvents,
        isToday: isSameDay(date, new Date())
      });

      // Следующий день
      date = new Date(date);
      date.setDate(date.getDate() + 1);
    }
  }

  previousMonth() {
    this.viewDate = subMonths(this.viewDate, 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.viewDate = addMonths(this.viewDate, 1);
    this.generateCalendar();
  }

  getMonthYear(): string {
    return format(this.viewDate, 'LLLL yyyy', { locale: ru });
  }

  ngAfterViewInit() {
    this.clickListener = (event: MouseEvent) => {
      if (this.isMenuOpen && 
          !this.menuRef.nativeElement.contains(event.target) &&
          !(event.target as Element).closest('.menu-btn')) {
        this.closeMenu();
      }
    };
    document.addEventListener('click', this.clickListener);
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.clickListener);
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  goUserProfile(){
    this.router.navigate(['/profile']);
  }

  goEvents(){
    this.router.navigate(['/events']);
    this.closeMenu();
  }

  createEvent() {
    this.router.navigate(['/events/create']);
    this.closeMenu();
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  async toggleStatus(index: number): Promise<void> {
    const item = this.items[index];
    if (!item) {
      alert('Элемент не найден');
      return;
    }

    if (item.type === 'task') {
      await this.toggleTaskStatus(item);
    } else if (item.type === 'performer') {
      await this.togglePerformerStatus(item);
    }
  }

  private async toggleTaskStatus(task: Task & { type: 'task' }): Promise<void> {
    const newStatusId = task.statusId === 0 ? 1 : 0;
    
    await this.eventSvc.updateTaskStatus(task.id, newStatusId).toPromise();
    
    // Обновляем локальные данные
    task.statusId = newStatusId;
    task.status = newStatusId === 1 ? 'Выполнено' : 'Не выполнено';
    
    // Обновляем массив задач
    const taskIndex = this.tasks.findIndex(t => t.id === task.id);
    if (taskIndex !== -1) {
      this.tasks[taskIndex] = task;
      this.createSvc.setTasks(this.tasks);
    }
  }

  async togglePerformerStatus(performer: Performer & { type: 'performer' }): Promise<void> {
    try {
      if (!performer) {
        alert('Исполнитель не найден');
        return;
      }
      const newStatusId = performer.statusId === 0 ? 1 : 0;

      const response = await firstValueFrom(
        this.createSvc.updatePerformerStatus(performer.id, newStatusId)
      );

      performer.statusId = response.newStatusId;
      performer.status = response.statusName;

      // Обновляем массив performers
      const performerIndex = this.performers.findIndex(p => p.id === performer.id);
      if (performerIndex !== -1) {
        this.performers[performerIndex] = performer;
        this.createSvc.setPerformers(this.performers);
      }
    } catch (err) {
      alert('Ошибка при обновлении статуса');
    }
  }
}
