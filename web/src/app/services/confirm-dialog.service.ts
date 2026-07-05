import { Injectable, signal } from '@angular/core';

export interface ConfirmDialogOptions {
  title?: string;
  text?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

interface ConfirmDialogState extends Required<ConfirmDialogOptions> {
  visible: boolean;
}

const DEFAULT_STATE: ConfirmDialogState = {
  visible: false,
  title: 'Are you sure?',
  text: "You won't be able to revert this!",
  confirmButtonText: 'Yes, delete it!',
  cancelButtonText: 'Cancel',
};

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {

  readonly state = signal<ConfirmDialogState>(DEFAULT_STATE);

  private resolveFn: ((confirmed: boolean) => void) | null = null;

  confirm(options: ConfirmDialogOptions = {}): Promise<boolean> {
    this.state.set({ ...DEFAULT_STATE, ...options, visible: true });

    return new Promise<boolean>((resolve) => {
      this.resolveFn = resolve;
    });
  }

  respond(confirmed: boolean): void {
    this.state.update((s) => ({ ...s, visible: false }));
    this.resolveFn?.(confirmed);
    this.resolveFn = null;
  }
}
