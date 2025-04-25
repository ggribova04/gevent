import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CreateEventStep1Component } from '../create-event-step1/create-event-step1.component';
import { CreateEventStep2Component } from '../create-event-step2/create-event-step2.component';

@Component({
  selector: 'app-event-step',
  standalone: true,
  imports: [CommonModule, RouterModule, CreateEventStep1Component, CreateEventStep2Component],
  template: `
    @if (currentStep === 1) {
      <app-create-event-step1 
        [activeStep]="currentStep"
        (stepCompleted)="nextStep()">
      </app-create-event-step1>
    }
    @if (currentStep === 2) {
      <app-create-event-step2
        [activeStep]="currentStep"
        (stepBack)="prevStep()">
      </app-create-event-step2>
    }
  `
})
export class EventStepComponent {
  currentStep = 1;

  nextStep() {
    this.currentStep = 2;
    this.router.navigate(['/events/create/step2']);
  }

  prevStep() {
    this.currentStep = 1;
    this.router.navigate(['/events/create/step1']);
  }

  constructor(private router: Router) {}
}