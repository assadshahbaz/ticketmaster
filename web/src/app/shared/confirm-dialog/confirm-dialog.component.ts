import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {

  public dialogService = inject(ConfirmDialogService)

  constructor() { }

  confirm() {
    this.dialogService.respond(true);
  }

  cancel() {
    this.dialogService.respond(false);
  }
}
