import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NavbarComponent } from '../../navbar/navbar';
import { ConfirmDialogComponent } from './confirm-dialog';

@Component({
  selector: 'app-manage-pyq',
  standalone: true,
  imports: [CommonModule, NavbarComponent, ConfirmDialogComponent],
  templateUrl: './manage-pyq.html',
  styleUrls: ['./manage-pyq.css']
})
export class ManagePyqComponent implements OnInit {
  pyqs: any[] = [];
  message = '';
  error = '';
  private apiUrl = 'http://localhost:8082/api/pyq';

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.fetchPyqs();
  }

  fetchPyqs(): void {
    this.http.get<any[]>(`${this.apiUrl}/all`).subscribe({
      next: (data) => {
        this.pyqs = data;
        this.error = '';
      },
      error: () => {
        this.error = 'Failed to load PYQs.';
        this.pyqs = [];
      },
    });
  }

  openDeleteDialog(pyq: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: pyq,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deletePyq(pyq.id);
      }
    });
  }

  deletePyq(id: number): void {
    this.http.delete(`${this.apiUrl}/delete/${id}`, { responseType: 'text' }).subscribe({
      next: () => {
        this.pyqs = this.pyqs.filter(pyq => pyq.id !== id);
        this.snackBar.open('✅ PYQ deleted successfully!', 'OK', { duration: 2500 });
      },
      error: () => {
        this.snackBar.open('❌ Failed to delete PYQ.', 'Dismiss', { duration: 3000 });
      },
    });
  }

  download(fileName: string): void {
    window.open(`${this.apiUrl}/download/${fileName}`, '_blank');
  }
}
