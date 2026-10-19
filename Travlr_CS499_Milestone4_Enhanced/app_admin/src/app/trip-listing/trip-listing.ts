import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TripCard } from '../trip-card/trip-card';
import { Trip } from '../model/trip';
import { TripData, TripPage } from '../services/trip-data';

import { Router } from '@angular/router';

@Component({
  selector: 'app-trip-listing',
  standalone: true,
  imports: [CommonModule, FormsModule, TripCard],
  templateUrl: './trip-listing.html',
  styleUrl: './trip-listing.css',
  providers: [TripData]
})
export class TripListing implements OnInit {

  trips: Trip[] = [];
  message = '';
  searchTerm = '';
  currentPage = 1;
  pageSize = 2;
  totalPages = 1;
  totalTrips = 0;
  loading = false;

  constructor(
    private tripData: TripData,
    private router: Router
  ) {}

  public addTrip(): void {
    this.router.navigate(['add-trip']);
  }

  private getTrips(): void {
    this.loading = true;

    this.tripData.getTrips(this.currentPage, this.pageSize, this.searchTerm)
      .subscribe({
        next: (result: TripPage) => {
          this.trips = result.trips;
          this.totalPages = Math.max(result.totalPages, 1);
          this.totalTrips = result.total;
          this.loading = false;

          if (this.totalTrips > 0) {
            this.message = `Showing ${this.trips.length} of ${this.totalTrips} trips.`;
          } else {
            this.message = 'No trips matched the current search.';
          }
        },
        error: () => {
          this.loading = false;
          this.message = 'Unable to retrieve trips from the database.';
        }
      });
  }

  public search(): void {
    this.currentPage = 1;
    this.getTrips();
  }

  public previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getTrips();
    }
  }

  public nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.getTrips();
    }
  }

  ngOnInit(): void {
    this.getTrips();
  }
}
