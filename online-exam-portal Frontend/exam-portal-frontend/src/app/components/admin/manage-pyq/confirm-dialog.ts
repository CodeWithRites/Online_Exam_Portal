import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title class="dialog-title">⚠️ Confirm Deletion</h2>
    <div class="dialog-content">
      <p>Are you sure you want to delete <strong>{{ data.subject }}</strong> ({{ data.year }})?</p>
    </div>
    <div class="dialog-actions">
      <button mat-button color="primary" (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="warn" (click)="onConfirm()">Yes, Delete</button>
    </div>
  `,
  styles: [`
    .dialog-title { text-align: center; color: #d32f2f; }
    .dialog-content { text-align: center; font-size: 15px; margin: 15px 0; }
    .dialog-actions {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-top: 10px;
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
