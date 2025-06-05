import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { CreateEventStep1Component } from '../create-event-step1/create-event-step1.component';
import { CreateEventStep2Component } from '../create-event-step2/create-event-step2.component';
import { CreateEventStep3Component } from '../create-event-step3/create-event-step3.component';
import { CreateEventStep4Component } from '../create-event-step4/create-event-step4.component';

@Component({
  selector: 'app-event-step',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    CreateEventStep1Component, 
    CreateEventStep2Component, 
    CreateEventStep3Component, 
    CreateEventStep4Component
  ],
  templateUrl: './event-step.component.html',
})
export class EventStepComponent {
  steps = [1, 2, 3, 4];
  currentStep = 1;
  isEditMode = false;
  eventId: string | null = null;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.eventId = params.get('id');
      this.isEditMode = !!this.eventId;
    });
  }

  handleStepCompleted(nextStep: number) {
    this.goToStep(nextStep);
  }

  handleStepNavigation(step: number) {
    this.goToStep(step);
  }

  goToStep(step: number) {
    if (step >= 1 && step <= 4) {
      this.currentStep = step;

      const stepPath = `step${step}`;
      if (this.isEditMode && this.eventId) {
        this.router.navigate([`/events/edit/${this.eventId}/${stepPath}`]);
      } else {
        this.router.navigate([`/events/create/${stepPath}`]);
      }
    }
  }
}