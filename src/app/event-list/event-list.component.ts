import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventService } from '../event.service';
import { Event } from '../models/event.model';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterModule],
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss'],
  providers: [DatePipe]
})
export class EventListComponent implements OnInit {
  events: Event[] = [];

  constructor(
    private eventService: EventService) {
  }

  ngOnInit(): void {
    this.eventService.getEvents().subscribe({
      next: (events) => {
        this.events = events;
      },
      error: (err) => {
        console.error('Error loading events:', err);
      }
    });
  }
}