import { Routes } from '@angular/router';
import { EventListComponent } from './event-list/event-list.component';
import { CreateEventStep1Component } from './create-event-step1/create-event-step1.component';
import { CreateEventStep2Component } from './create-event-step2/create-event-step2.component';
import { CreateEventStep3Component } from './create-event-step3/create-event-step3.component';
import { CreateEventStep4Component } from './create-event-step4/create-event-step4.component';
import { EventStepComponent } from './event-step/event-step.component';
import { MainPageComponent } from './main-page/main-page.component';
import { StartPageComponent } from './start-page/start-page.component';
import { AuthGuard } from './services/auth.guard';
import { RoleGuard } from './services/role.guard';
import { UserProfileComponent } from './user-profile/user-profile.component'
import { UserProfileEditComponent } from './user-profile-edit/user-profile-edit.component'

const routeConfig: Routes = [
  { path: 'events', component: EventListComponent, title: 'Список мероприятий', canActivate: [AuthGuard, RoleGuard] },
  { path: '', component: StartPageComponent, title: 'GEvent', canActivate: [AuthGuard] },
  { path: 'main', component: MainPageComponent, title: 'GEvent', canActivate: [AuthGuard] },
  { path: 'profile', component: UserProfileComponent, title: 'Личный профиль', canActivate: [AuthGuard] },
  { path: 'profile/edit', component: UserProfileEditComponent, title: 'Редактировать информацию', canActivate: [AuthGuard] },
  {
    path: 'events/create',
    component: EventStepComponent,
    canActivate: [AuthGuard, RoleGuard],
    children: [
      { path: 'step1', component: CreateEventStep1Component, title: 'Основные данные мероприятия', canActivate: [AuthGuard, RoleGuard] },
      { path: 'step2', component: CreateEventStep2Component, title: 'Список исполнителей', canActivate: [AuthGuard, RoleGuard] },
      { path: 'step3', component: CreateEventStep3Component, title: 'Список задач', canActivate: [AuthGuard, RoleGuard] },
      { path: 'step4', component: CreateEventStep4Component, title: 'Список гостей', canActivate: [AuthGuard, RoleGuard] },
    ]
  },
  {
    path: 'events/edit/:id',
    component: EventStepComponent,
    canActivate: [AuthGuard, RoleGuard],
    children: [
      { path: 'step1', component: CreateEventStep1Component, title: 'Редактируем мероприятие - шаг 1', canActivate: [AuthGuard, RoleGuard] },
      { path: 'step2', component: CreateEventStep2Component, title: 'Редактируем мероприятие - шаг 2', canActivate: [AuthGuard, RoleGuard] },
      { path: 'step3', component: CreateEventStep3Component, title: 'Редактируем мероприятие - шаг 3', canActivate: [AuthGuard, RoleGuard] },
      { path: 'step4', component: CreateEventStep4Component, title: 'Редактируем мероприятие - шаг 4', canActivate: [AuthGuard, RoleGuard] }
    ]
  }
];
export default routeConfig;