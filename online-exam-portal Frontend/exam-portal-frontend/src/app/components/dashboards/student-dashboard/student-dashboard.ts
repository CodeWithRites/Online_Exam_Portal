import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../navbar/navbar';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './student-dashboard.html',
  styleUrls: ['./student-dashboard.css']
})
export class StudentDashboardComponent {
  studentName = localStorage.getItem('studentName') || 'Student';

  constructor(private router: Router, private auth: AuthService) {}

  navigate(page: string) {
    this.router.navigate([`/student/${page}`]);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
