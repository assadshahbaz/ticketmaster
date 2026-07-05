import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TicketService } from '../../services/ticket.service';


@Component({
  selector: 'app-ticket-add-edit',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
  ],
  templateUrl: './add-edit.component.html',
})
export class TicketAddEditComponent implements OnInit {

  public name = '';
  public sortingId?: number;

  public ticketId?: string;

  protected ticketService = inject(TicketService);

  // Captured here (a valid injection context) so it can be passed explicitly to
  // takeUntilDestroyed(this.destroyRef) from regular methods, which are not injection contexts.
  private destroyRef = inject(DestroyRef);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.ticketId = this.route.snapshot.params['id'];

    if (this.ticketId) {
      this.fetchById(this.ticketId);
    }
  }

  private fetchById(id: string): void {
    this.ticketService
      .fetchById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((ticket) => {
        this.name = ticket.name;
        this.sortingId = ticket.sorting_id;
      });
  }

  public onSubmit(): void {
    this.ticketId ? this.update(this.ticketId) : this.save();
  }

  private save(): void {
    this.ticketService
      .create({ name: this.name })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.router.navigate(['/tickets']);
      });
  }

  private update(id: string): void {
    this.ticketService
      .update(id, { name: this.name })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.router.navigate(['/tickets']);
      });
  }
}
