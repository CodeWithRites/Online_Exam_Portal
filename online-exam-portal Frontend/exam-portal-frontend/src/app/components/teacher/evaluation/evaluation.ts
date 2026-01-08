import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TeacherService } from '../../../services/teacher.service';

@Component({
  selector: 'app-evaluation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './evaluation.html',
  styleUrls: ['./evaluation.css']
})
export class EvaluationComponent implements OnInit {
  submissions: any[] = [];
  loading = true;
  error = '';

  constructor(private teacherService: TeacherService, private router: Router) {}

  ngOnInit(): void {
    this.loadSubmissions();
  }

  /** 🧾 Load all submissions */
  loadSubmissions(): void {
    this.loading = true;
    this.teacherService.getAllSubmissions().subscribe({
      next: (res: any) => {
        this.submissions = Array.isArray(res) ? res : res.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Failed to load submissions', err);
        this.error = 'Failed to load submissions.';
        this.loading = false;
      }
    });
  }

  /** 🧮 View or edit specific submission */
  viewSubmission(id: number): void {
    this.router.navigate(['/teacher/evaluate', id]);
  }

  /** 🏠 Navigate to Teacher Dashboard */
  goToTeacherDashboard(): void {
    this.router.navigate(['/teacher-dashboard']);
  }
}
