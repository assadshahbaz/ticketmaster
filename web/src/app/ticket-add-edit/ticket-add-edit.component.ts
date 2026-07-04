import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TicketService } from '../services/ticket.service';
import { Ticket } from '../model/ticket.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ticket-add-edit',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
  ],
  templateUrl: './ticket-add-edit.component.html',
  styleUrl: './ticket-add-edit.component.css',
})
export class TicketAddEditComponent implements OnInit {

  ticket: Ticket = { _id: '', sorting_id: 0, name: '' };
  isEditing = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService
  ) { }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.isEditing = true;
        this.ticketService.getTicketById(id).subscribe((ticket) => {
          this.ticket = ticket;
        });
      }
    });
  }

  saveTicket() {
    if (this.isEditing) {
      this.ticketService.updateTicket(this.ticket._id, this.ticket).subscribe(() => {
        this.router.navigate(['/tickets']);        
      });
    } else {
      this.ticketService.createTicket({name: this.ticket.name}).subscribe(() => {
        this.router.navigate(['/tickets']);
      });
    }
  }

}