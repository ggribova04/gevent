import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateEventService } from '../services/create-event.service';

@Component({
  selector: 'app-create-event-step1',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './create-event-step1.component.html',
  styleUrls: ['./create-event-step1.component.scss']
})
export class CreateEventStep1Component{
  title = '';
  date = '';
  time = '';
  isFormInvalid = false;

  @Input() activeStep!: number; // Получаем от родителя
  @Output() stepCompleted = new EventEmitter<void>(); // Уведомляем родителя

  constructor(
    private router: Router,
    private createSvc: CreateEventService,
  ) {
    const snap = this.createSvc.getSnapshot();
    this.title = snap.title;
    this.date = snap.date;
    this.time = snap.time;
  }

  // Переходим к следующему шагу, если форма не инвалид
  nextStep() {
    if (!this.title.trim() || !this.date || !this.time.trim()) {
      this.isFormInvalid = true;
      return;
    }

    this.isFormInvalid = false;
    this.createSvc.setStep1({
      title: this.title,
      date: this.date,
      time: this.time
    });

    this.stepCompleted.emit();
  }
}
