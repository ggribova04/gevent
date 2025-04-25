import { Routes } from '@angular/router';
import { EventListComponent } from './event-list/event-list.component';
import { CreateEventStep1Component } from './create-event-step1/create-event-step1.component';
import { CreateEventStep2Component } from './create-event-step2/create-event-step2.component';
import { EventStepComponent } from './event-step/event-step.component';

const routeConfig: Routes = [
  { path: 'events', component: EventListComponent, title: 'Список мероприятий' },
  { path: '', redirectTo: 'events', pathMatch: 'full' },
  {
    path: 'events/create',
    component: EventStepComponent,
    children: [
      { path: 'step1', component: CreateEventStep1Component, title: 'Основные данные мероприятия' },
      { path: 'step2', component: CreateEventStep2Component, title: 'Список гостей' },
    ]
  }
];
export default routeConfig;