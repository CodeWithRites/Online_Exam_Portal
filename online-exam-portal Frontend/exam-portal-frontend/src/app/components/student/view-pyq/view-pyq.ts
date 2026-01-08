import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../navbar/navbar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-pyq',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './view-pyq.html',
  styleUrls: ['./view-pyq.css']
})
export class ViewPyqComponent implements OnInit {
  pyqs: any[] = [];
  isLoading = true;
  errorMessage = '';

  private apiUrl = 'http://localhost:8082/api/pyq/all';
  private downloadUrl = 'http://localhost:8082/api/pyq/download/';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.fetchPyqs();
  }

  /** ✅ Fetch PYQs */
  fetchPyqs() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.pyqs = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching PYQs:', err);
        this.errorMessage = 'Failed to load previous year questions.';
        this.isLoading = false;
      }
    });
  }

  /** ⬇ Download a PYQ */
  downloadPyq(fileName: string) {
    const url = this.downloadUrl + fileName;
    window.open(url, '_blank');
  }

  /** 🏠 Navigate to Student Dashboard */
  goToDashboard(): void {
    this.router.navigate(['/student-dashboard']);
  }
}
